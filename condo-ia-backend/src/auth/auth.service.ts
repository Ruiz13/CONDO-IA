import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  async login(email: string, passwordHash: string) {
    // IMPORTANTE: Siguiendo las recomendaciones de seguridad, 
    // la validación de contraseñas se hace con la base de datos tradicional, NO con Gemini.
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Nota: Para MVP comparamos directamente. En producción se usaría bcrypt.compare()
    if (user.passwordHash !== passwordHash) {
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
        mustChangePassword: user.mustChangePassword
      }
    };
  }

  async changePassword(userId: string, newPasswordHash: string) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: newPasswordHash,
        mustChangePassword: false,
      },
    });
    return { success: true, message: 'Contraseña actualizada correctamente' };
  }
}
