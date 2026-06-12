"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const bcrypt = __importStar(require("bcrypt"));
let TenantsService = class TenantsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async onboardTenant(data) {
        const { name, floors, aptsPerFloor, locales, aptAliquot, apiKey, address, city, state, country, phone } = data;
        const totalApts = floors * aptsPerFloor;
        const totalAptAliquotSum = totalApts * aptAliquot;
        if (totalAptAliquotSum > 100) {
            throw new common_1.BadRequestException('La sumatoria de las alícuotas de los apartamentos excede el 100%.');
        }
        let localAliquot = 0;
        if (locales > 0) {
            const remainingAliquot = 100 - totalAptAliquotSum;
            localAliquot = remainingAliquot / locales;
        }
        else if (totalAptAliquotSum !== 100) {
            throw new common_1.BadRequestException('No hay locales para absorber la alícuota restante, y los apartamentos no suman 100%.');
        }
        return await this.prisma.$transaction(async (tx) => {
            const tenant = await tx.tenant.create({
                data: { name, address, city, state, country, phone }
            });
            const adminEmail = `admin@${name.replace(/\s+/g, '').toLowerCase()}.com`;
            const existingUser = await tx.user.findUnique({ where: { email: adminEmail } });
            if (existingUser) {
                throw new common_1.BadRequestException(`El correo genérico ${adminEmail} ya está en uso. Intenta con un nombre de edificio ligeramente distinto.`);
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
    async deleteTenant(tenantId) {
        return await this.prisma.$transaction(async (tx) => {
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
    async toggleTenantStatus(tenantId) {
        const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
        if (!tenant)
            throw new common_1.BadRequestException('Condominio no encontrado');
        return this.prisma.tenant.update({
            where: { id: tenantId },
            data: { isActive: !tenant.isActive }
        });
    }
    async updateTenantLogo(tenantId, logoBase64) {
        try {
            await this.prisma.tenant.update({
                where: { id: tenantId },
                data: { logoBase64 }
            });
            return { message: 'Logo actualizado correctamente' };
        }
        catch (error) {
            console.error(`Error updating logo for tenant ${tenantId}`, error);
            throw new common_1.HttpException('Error al actualizar el logo', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async updateTenantSettings(tenantId, data) {
        try {
            await this.prisma.tenant.update({
                where: { id: tenantId },
                data
            });
            return { message: 'Configuración actualizada correctamente' };
        }
        catch (error) {
            console.error(`Error updating settings for tenant ${tenantId}`, error);
            throw new common_1.HttpException('Error al actualizar la configuración', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async resetAdminPassword(tenantId) {
        const admin = await this.prisma.user.findFirst({
            where: { tenantId, role: 'ADMIN' }
        });
        if (!admin)
            throw new common_1.BadRequestException('Administrador no encontrado');
        const tempPasswordHash = await bcrypt.hash('admin123', 10);
        await this.prisma.user.update({
            where: { id: admin.id },
            data: { passwordHash: tempPasswordHash, mustChangePassword: true }
        });
        return { success: true, message: 'Clave reseteada a admin123 correctamente' };
    }
    async createTenantWithAdmin(data) {
        const { tenantName, adminEmail, adminPassword } = data;
        const existingUser = await this.prisma.user.findUnique({ where: { email: adminEmail } });
        if (existingUser) {
            throw new common_1.BadRequestException('El correo del administrador ya está en uso');
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
    async getUnitsByTenant(tenantId) {
        return this.prisma.unit.findMany({
            where: { tenantId },
            include: {
                owner: { select: { id: true, email: true } },
                invoices: true
            },
            orderBy: { unitNumber: 'asc' }
        });
    }
    async createUnitAndOwner(tenantId, unitNumber, ownerEmail, ownerPassword, aliquotPercentage) {
        const existingUser = await this.prisma.user.findUnique({ where: { email: ownerEmail } });
        if (existingUser) {
            throw new common_1.BadRequestException('El correo del propietario ya está en uso');
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
                    isCommercial: false,
                    aliquotPercentage
                }
            });
            return { success: true, unit };
        });
    }
    async getTenantStats(tenantId) {
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const ingresos = await this.prisma.payment.aggregate({
            where: {
                tenantId,
                status: 'APPROVED',
                createdAt: { gte: firstDayOfMonth }
            },
            _sum: { amount: true }
        });
        const gastos = await this.prisma.expense.aggregate({
            where: {
                tenantId,
                date: { gte: firstDayOfMonth }
            },
            _sum: { amount: true }
        });
        const pagosPendientes = await this.prisma.payment.count({
            where: { tenantId, status: 'PENDING' }
        });
        const totalResidentes = await this.prisma.unit.count({
            where: { tenantId }
        });
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
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        try {
            await this.prisma.message.deleteMany({
                where: { createdAt: { lt: sevenDaysAgo } }
            });
        }
        catch (e) {
            console.error('Error al limpiar mensajes antiguos en getStats:', e);
        }
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
    async getFinancialReport(tenantId) {
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
    async deleteUnit(tenantId, unitId) {
        return await this.prisma.$transaction(async (tx) => {
            const unit = await tx.unit.findUnique({ where: { id: unitId, tenantId } });
            if (!unit)
                throw new common_1.BadRequestException('Apartamento no encontrado');
            await tx.payment.deleteMany({ where: { unitId } });
            await tx.invoice.deleteMany({ where: { unitId } });
            await tx.unit.delete({ where: { id: unitId } });
            if (unit.ownerId) {
                await tx.message.deleteMany({ where: { userId: unit.ownerId } });
                await tx.user.delete({ where: { id: unit.ownerId } });
            }
            return { success: true, message: 'Residente eliminado correctamente' };
        });
    }
    async clearFinances(tenantId) {
        return await this.prisma.$transaction(async (tx) => {
            await tx.payment.deleteMany({ where: { tenantId } });
            await tx.invoice.deleteMany({ where: { tenantId } });
            await tx.expense.deleteMany({ where: { tenantId } });
            return { success: true, message: 'Finanzas limpiadas correctamente' };
        });
    }
    async resetAllResidentPasswords() {
        const bcrypt = require('bcrypt');
        const hash = await bcrypt.hash('admin123', 10);
        const result = await this.prisma.user.updateMany({
            where: { role: 'RESIDENT' },
            data: { passwordHash: hash, mustChangePassword: true }
        });
        return { success: true, updated: result.count, newPassword: 'admin123' };
    }
    async debugUsers() {
        const users = await this.prisma.user.findMany({
            select: {
                email: true,
                role: true,
                tenant: { select: { name: true, isActive: true } }
            },
            orderBy: { role: 'asc' }
        });
        return { total: users.length, users };
    }
    async reactivateAllTenants() {
        const result = await this.prisma.tenant.updateMany({
            where: { isActive: false },
            data: { isActive: true }
        });
        const tenants = await this.prisma.tenant.findMany({
            select: { id: true, name: true, isActive: true }
        });
        return {
            success: true,
            reactivated: result.count,
            tenants
        };
    }
};
exports.TenantsService = TenantsService;
exports.TenantsService = TenantsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TenantsService);
//# sourceMappingURL=tenants.service.js.map