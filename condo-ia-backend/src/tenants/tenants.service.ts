import { Injectable, BadRequestException } from '@nestjs/common';
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
  }) {
    const { name, floors, aptsPerFloor, locales, aptAliquot, apiKey } = data;

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
        data: { name }
      });

      // TODO: Guardar el apiKey en algún lado seguro si fuera necesario en el esquema.
      // Actualmente schema.prisma de Tenant no tiene campo apiKey. 
      // Por MVP lo omitimos de la inserción a base de datos.

      // 2. Hash para la contraseña temporal genérica
      const tempPasswordHash = await bcrypt.hash('CondoIA2026*', 10);

      // 3. Crear el Administrador
      const adminEmail = `admin@${name.replace(/\s+/g, '').toLowerCase()}.com`;
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
    });
  }
}
