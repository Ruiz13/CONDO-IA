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
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
let AuthService = AuthService_1 = class AuthService {
    prisma;
    jwtService;
    logger = new common_1.Logger(AuthService_1.name);
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async login(email, passwordHash) {
        console.log(`[LOGIN ATTEMPT] Email: ${email}, Password length: ${passwordHash?.length}`);
        const user = await this.prisma.user.findUnique({
            where: { email },
            include: { tenant: true }
        });
        if (!user) {
            console.log(`[LOGIN FAILED] User not found for email: ${email}`);
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        }
        console.log(`[LOGIN] User found. Role: ${user.role}, Tenant: ${user.tenant ? user.tenant.name : 'NONE'}`);
        if (user.role !== 'SUPER_ADMIN' && user.tenant && user.tenant.isActive === false) {
            console.log(`[LOGIN BLOCKED] Tenant suspended for user: ${email}`);
            throw new common_1.UnauthorizedException('Condominio suspendido por falta de pago.');
        }
        const isPasswordValid = await bcrypt.compare(passwordHash, user.passwordHash) || user.passwordHash === passwordHash;
        console.log(`[LOGIN] isPasswordValid: ${isPasswordValid}`);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        }
        const payload = { sub: user.id, email: user.email, role: user.role, tenantId: user.tenantId, mustChangePassword: user.mustChangePassword };
        return {
            access_token: await this.jwtService.signAsync(payload),
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                tenantId: user.tenantId,
                tenantName: user.tenant?.name || 'Mi Edificio',
                mustChangePassword: user.mustChangePassword,
                avatarBase64: user.avatarBase64
            }
        };
    }
    async changePassword(userId, newPasswordHash) {
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: {
                passwordHash: newPasswordHash,
                mustChangePassword: false,
            },
        });
        return { success: true, message: 'Contraseña actualizada correctamente' };
    }
    async updateProfile(userId, newEmail, newPassword) {
        const data = {};
        if (newEmail) {
            const existing = await this.prisma.user.findUnique({ where: { email: newEmail } });
            if (existing && existing.id !== userId) {
                throw new common_1.BadRequestException('Ese correo ya está en uso por otra persona.');
            }
            data.email = newEmail;
        }
        if (newPassword) {
            data.passwordHash = await bcrypt.hash(newPassword, 10);
            data.mustChangePassword = false;
        }
        const user = await this.prisma.user.update({
            where: { id: userId },
            data
        });
        return {
            success: true,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                tenantId: user.tenantId,
                mustChangePassword: user.mustChangePassword,
                avatarBase64: user.avatarBase64
            }
        };
    }
    async updateAvatar(userId, avatarBase64) {
        await this.prisma.user.update({
            where: { id: userId },
            data: { avatarBase64 },
        });
        return { success: true, message: 'Avatar actualizado' };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map