import { Injectable, UnauthorizedException, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  async login(email: string, passwordHash: string) {
    console.log(`[LOGIN ATTEMPT] Email: ${email}, Password length: ${passwordHash?.length}`);
    // IMPORTANTE: Siguiendo las recomendaciones de seguridad, 
    // la validación de contraseñas se hace con la base de datos tradicional, NO con Gemini.
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { tenant: true }
    });

    if (!user) {
      console.log(`[LOGIN FAILED] User not found for email: ${email}`);
      throw new UnauthorizedException('Credenciales inválidas');
    }

    console.log(`[LOGIN] User found. Role: ${user.role}, Tenant: ${user.tenant ? user.tenant.name : 'NONE'}`);

    if (user.role !== 'SUPER_ADMIN' && user.tenant && user.tenant.isActive === false) {
      console.log(`[LOGIN BLOCKED] Tenant suspended for user: ${email}`);
      throw new UnauthorizedException('Condominio suspendido por falta de pago.');
    }

    // Usamos bcrypt.compare para máxima seguridad (Super Admin y futuros usuarios)
    // Para retrocompatibilidad del MVP, también probamos si coincide en texto plano
    const isPasswordValid = await bcrypt.compare(passwordHash, user.passwordHash) || user.passwordHash === passwordHash;
    console.log(`[LOGIN] isPasswordValid: ${isPasswordValid}`);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
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

  async changePassword(userId: string, newPasswordPlain: string) {
    const passwordHash = await bcrypt.hash(newPasswordPlain, 10);
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash,
        mustChangePassword: false,
      },
    });
    return { success: true, message: 'Contraseña actualizada correctamente' };
  }

  async updateProfile(userId: string, newEmail?: string, newPassword?: string) {
    const data: any = {};
    if (newEmail) {
      // Verificar si el correo ya existe
      const existing = await this.prisma.user.findUnique({ where: { email: newEmail } });
      if (existing && existing.id !== userId) {
        throw new BadRequestException('Ese correo ya está en uso por otra persona.');
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

  async updateAvatar(userId: string, avatarBase64: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { avatarBase64 },
    });
    return { success: true, message: 'Avatar actualizado' };
  }

  async adminResetPassword(adminId: string, targetEmail: string, newPasswordPlain: string) {
    const admin = await this.prisma.user.findUnique({ where: { id: adminId } });
    if (!admin || (admin.role !== 'ADMIN' && admin.role !== 'SUPER_ADMIN')) {
      throw new UnauthorizedException('No tienes permisos para realizar esta acción');
    }

    const targetUser = await this.prisma.user.findUnique({ where: { email: targetEmail } });
    if (!targetUser) {
      throw new BadRequestException('El usuario especificado no existe');
    }

    // Si es ADMIN, solo puede cambiar de su propio tenant
    if (admin.role === 'ADMIN' && targetUser.tenantId !== admin.tenantId) {
      throw new UnauthorizedException('No tienes permisos para modificar a este usuario');
    }

    const passwordHash = await bcrypt.hash(newPasswordPlain, 10);
    
    await this.prisma.user.update({
      where: { id: targetUser.id },
      data: { 
        passwordHash,
        mustChangePassword: true // Opcional: forzar al usuario a cambiarla al entrar
      }
    });

    return { success: true, message: 'Clave restablecida correctamente' };
  }
}
