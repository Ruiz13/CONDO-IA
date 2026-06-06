import { Injectable, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) {}

  async onboardTenant(data: {
    name: string;
    floors: number;
    aptsPerFloor: number;
    locales: number;
    aptAliquot: number;
    apiKey?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    phone?: string;
  }) {
    const { name, floors, aptsPerFloor, locales, aptAliquot, apiKey, address, city, state, country, phone } = data;

    // Validación Matemática de Alícuotas
    const totalApts = floors * aptsPerFloor;
    const totalAptAliquotSum = totalApts * aptAliquot;

    if (totalAptAliquotSum > 100) {
      throw new BadRequestException('La sumatoria de las alícuotas de los apartamentos excede el 100%.');
    }

    let localAliquot = 0;
    if (locales > 0) {
      const remainingAliquot = 100 - totalAptAliquotSum;
      localAliquot = remainingAliquot / locales;
    } else if (totalAptAliquotSum !== 100) {
      throw new BadRequestException('No hay locales para absorber la alícuota restante, y los apartamentos no suman 100%.');
    }

    // Transacción masiva
    return await this.prisma.$transaction(async (tx) => {
      // 1. Crear el Condominio
      const tenant = await tx.tenant.create({
        data: { name, address, city, state, country, phone }
      });

      // TODO: Guardar el apiKey en algún lado seguro si fuera necesario en el esquema.
      // Actualmente schema.prisma de Tenant no tiene campo apiKey. 
      // Por MVP lo omitimos de la inserción a base de datos.

      // 2. Hash para la contraseña temporal genérica
      // 3. Crear el Administrador
      const adminEmail = `admin@${name.replace(/\s+/g, '').toLowerCase()}.com`;
      
      const existingUser = await tx.user.findUnique({ where: { email: adminEmail } });
      if (existingUser) {
        throw new BadRequestException(`El correo genérico ${adminEmail} ya está en uso. Intenta con un nombre de edificio ligeramente distinto.`);
      }

      const tempPasswordHash = await bcrypt.hash('admin123', 10);
      await tx.user.create({
        data: {
          email: adminEmail,
          passwordHash: tempPasswordHash,
          role: 'ADMIN',
          mustChangePassword: true,
          tenantId: tenant.id
        }
      });

      // 4. Crear Apartamentos y Dueños
      for (let f = 1; f <= floors; f++) {
        for (let a = 1; a <= aptsPerFloor; a++) {
          const unitNumber = `${f}-${a}`;
          
          const owner = await tx.user.create({
            data: {
              email: `apto${unitNumber}@${name.replace(/\s+/g, '').toLowerCase()}.com`,
              passwordHash: tempPasswordHash,
              role: 'RESIDENT',
              mustChangePassword: true,
              tenantId: tenant.id
            }
          });

          await tx.unit.create({
            data: {
              tenantId: tenant.id,
              ownerId: owner.id,
              unitNumber: `Apto ${unitNumber}`,
              isCommercial: false,
              aliquotPercentage: aptAliquot
            }
          });
        }
      }

      // 5. Crear Locales Comerciales y Dueños
      for (let l = 1; l <= locales; l++) {
        const unitNumber = `L-${l}`;

        const owner = await tx.user.create({
          data: {
            email: `local${l}@${name.replace(/\s+/g, '').toLowerCase()}.com`,
            passwordHash: tempPasswordHash,
            role: 'RESIDENT',
            mustChangePassword: true,
            tenantId: tenant.id
          }
        });

        await tx.unit.create({
          data: {
            tenantId: tenant.id,
            ownerId: owner.id,
            unitNumber: `Local ${l}`,
            isCommercial: true,
            aliquotPercentage: localAliquot
          }
        });
      }

      return {
        success: true,
        message: 'Condominio generado exitosamente',
        tenantId: tenant.id,
        adminEmail,
        totalApts,
        totalLocales: locales
      };
    }, { timeout: 60000 });
  }

  // --- Funciones del Super Admin ---

  async getAllTenants() {
    return this.prisma.tenant.findMany({
      include: {
        users: {
          where: { role: 'ADMIN' },
          select: { email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async deleteTenant(tenantId: string) {
    return await this.prisma.$transaction(async (tx) => {
      // Borrar todas las dependencias en orden inverso para respetar las claves foráneas
      await tx.knowledgeDocument.deleteMany({ where: { tenantId } });
      await tx.message.deleteMany({ where: { tenantId } });
      await tx.vote.deleteMany({ where: { poll: { tenantId } } });
      await tx.pollOption.deleteMany({ where: { poll: { tenantId } } });
      await tx.poll.deleteMany({ where: { tenantId } });
      await tx.announcement.deleteMany({ where: { tenantId } });
      await tx.payment.deleteMany({ where: { tenantId } });
      await tx.invoice.deleteMany({ where: { tenantId } });
      await tx.expense.deleteMany({ where: { tenantId } });
      await tx.unit.deleteMany({ where: { tenantId } });
      await tx.auditLog.deleteMany({ where: { tenantId } });
      await tx.user.deleteMany({ where: { tenantId } });
      await tx.tenant.delete({ where: { id: tenantId } });
      
      return { success: true, message: 'Edificio eliminado correctamente' };
    }, { timeout: 60000 });
  }

  async toggleTenantStatus(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw new BadRequestException('Condominio no encontrado');
    return this.prisma.tenant.update({
      where: { id: tenantId },
      data: { isActive: !tenant.isActive }
    });
  }

  async updateTenantLogo(tenantId: string, logoBase64: string) {
    try {
      await this.prisma.tenant.update({
        where: { id: tenantId },
        data: { logoBase64 }
      });
      return { message: 'Logo actualizado correctamente' };
    } catch (error) {
      console.error(`Error updating logo for tenant ${tenantId}`, error);
      throw new HttpException('Error al actualizar el logo', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateTenantSettings(tenantId: string, data: { rif?: string; address?: string; phone?: string; city?: string; state?: string; country?: string }) {
    try {
      await this.prisma.tenant.update({
        where: { id: tenantId },
        data
      });
      return { message: 'Configuración actualizada correctamente' };
    } catch (error) {
      console.error(`Error updating settings for tenant ${tenantId}`, error);
      throw new HttpException('Error al actualizar la configuración', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async resetAdminPassword(tenantId: string) {
    // Buscar al usuario administrador del condominio
    const admin = await this.prisma.user.findFirst({
      where: { tenantId, role: 'ADMIN' }
    });
    if (!admin) throw new BadRequestException('Administrador no encontrado');

    const tempPasswordHash = await bcrypt.hash('admin123', 10);
    await this.prisma.user.update({
      where: { id: admin.id },
      data: { passwordHash: tempPasswordHash, mustChangePassword: true }
    });

    return { success: true, message: 'Clave reseteada a admin123 correctamente' };
  }

  async createTenantWithAdmin(data: { tenantName: string; adminEmail: string; adminPassword: string }) {
    const { tenantName, adminEmail, adminPassword } = data;

    const existingUser = await this.prisma.user.findUnique({ where: { email: adminEmail } });
    if (existingUser) {
      throw new BadRequestException('El correo del administrador ya está en uso');
    }

    const passwordHash = await bcrypt.hash(adminPassword, 10);

    return await this.prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: { name: tenantName }
      });

      await tx.user.create({
        data: {
          email: adminEmail,
          passwordHash,
          role: 'ADMIN',
          mustChangePassword: true,
          tenantId: tenant.id
        }
      });

      return { success: true, message: 'Edificio y Administrador creados con éxito', tenantId: tenant.id };
    });
  }

  // --- Funciones del Administrador del Condominio ---

  async getUnitsByTenant(tenantId: string) {
    return this.prisma.unit.findMany({
      where: { tenantId },
      include: {
        owner: { select: { id: true, email: true } },
        invoices: true
      },
      orderBy: { unitNumber: 'asc' }
    });
  }

  async createUnitAndOwner(tenantId: string, unitNumber: string, ownerEmail: string, ownerPassword: string, aliquotPercentage: number) {
    const existingUser = await this.prisma.user.findUnique({ where: { email: ownerEmail } });
    if (existingUser) {
      throw new BadRequestException('El correo del propietario ya está en uso');
    }

    const passwordHash = await bcrypt.hash(ownerPassword, 10);

    return await this.prisma.$transaction(async (tx) => {
      const owner = await tx.user.create({
        data: {
          email: ownerEmail,
          passwordHash,
          role: 'RESIDENT',
          mustChangePassword: true,
          tenantId
        }
      });

      const unit = await tx.unit.create({
        data: {
          tenantId,
          ownerId: owner.id,
          unitNumber,
          isCommercial: false, // Por defecto para MVP
          aliquotPercentage
        }
      });

      return { success: true, unit };
    });
  }

  async getTenantStats(tenantId: string) {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Ingresos del mes: pagos aprobados este mes
    const ingresos = await this.prisma.payment.aggregate({
      where: {
        tenantId,
        status: 'APPROVED',
        createdAt: { gte: firstDayOfMonth }
      },
      _sum: { amount: true }
    });

    // Gastos del mes
    const gastos = await this.prisma.expense.aggregate({
      where: {
        tenantId,
        date: { gte: firstDayOfMonth }
      },
      _sum: { amount: true }
    });

    // Pagos por aprobar
    const pagosPendientes = await this.prisma.payment.count({
      where: { tenantId, status: 'PENDING' }
    });

    // Total de residentes (unidades)
    const totalResidentes = await this.prisma.unit.count({
      where: { tenantId }
    });

    // Morosidad del mes actual
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const pagados = await this.prisma.invoice.count({
      where: { tenantId, month, year, status: 'PAID' }
    });
    const pendientes = await this.prisma.invoice.count({
      where: { tenantId, month, year, status: 'PENDING' }
    });
    const morosidadData = [
      { name: 'Solventes', value: pagados },
      { name: 'Morosos', value: pendientes }
    ];

    // Consultas IA en los últimos 7 días
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);
    const recentMessages = await this.prisma.message.findMany({
      where: { tenantId, isBot: false, createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true }
    });
    
    const consultasMap = new Map();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      consultasMap.set(d.toISOString().split('T')[0], 0);
    }
    recentMessages.forEach(m => {
      const dStr = m.createdAt.toISOString().split('T')[0];
      if (consultasMap.has(dStr)) {
        consultasMap.set(dStr, consultasMap.get(dStr) + 1);
      }
    });
    const consultasIA = Array.from(consultasMap.entries()).map(([date, count]) => ({ date, count }));

    return {
      ingresosDelMes: ingresos._sum.amount || 0,
      gastosDelMes: gastos._sum.amount || 0,
      pagosPorAprobar: pagosPendientes,
      totalResidentes,
      morosidadData,
      consultasIA
    };
  }

  async getFinancialReport(tenantId: string) {
    const payments = await this.prisma.payment.findMany({
      where: { tenantId, status: 'APPROVED' },
      include: { unit: true },
      orderBy: { createdAt: 'desc' }
    });

    const expenses = await this.prisma.expense.findMany({
      where: { tenantId },
      orderBy: { date: 'desc' }
    });

    return { payments, expenses };
  }

  async deleteUnit(tenantId: string, unitId: string) {
    return await this.prisma.$transaction(async (tx) => {
      const unit = await tx.unit.findUnique({ where: { id: unitId, tenantId } });
      if (!unit) throw new BadRequestException('Apartamento no encontrado');

      // Borrar facturas y pagos
      await tx.payment.deleteMany({ where: { unitId } });
      await tx.invoice.deleteMany({ where: { unitId } });
      
      // Borrar el apartamento
      await tx.unit.delete({ where: { id: unitId } });

      // Si tiene usuario asociado, borrar sus mensajes y el usuario
      if (unit.ownerId) {
        await tx.message.deleteMany({ where: { userId: unit.ownerId } });
        await tx.user.delete({ where: { id: unit.ownerId } });
      }

      return { success: true, message: 'Residente eliminado correctamente' };
    });
  }
}
