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
        const { name, floors, aptsPerFloor, locales, aptAliquot, apiKey } = data;
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
                data: { name }
            });
            const tempPasswordHash = await bcrypt.hash('CondoIA2026*', 10);
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
        });
    }
};
exports.TenantsService = TenantsService;
exports.TenantsService = TenantsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TenantsService);
//# sourceMappingURL=tenants.service.js.map