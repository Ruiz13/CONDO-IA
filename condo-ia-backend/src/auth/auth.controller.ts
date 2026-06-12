import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body: any) {
    try {
      return await this.authService.login(body.email, body.password);
    } catch (error: any) {
      return { 
        debugError: true, 
        message: error.message, 
        stack: error.stack,
        name: error.name
      };
    }
  }

  @Post('change-password')
  changePassword(@Body() body: any) {
    // Para simplificar el MVP, pasamos el userId directamente en el body
    // En producción se sacaría del token JWT con un Guard
    return this.authService.changePassword(body.userId, body.newPassword);
  }

  @Post('update-avatar')
  updateAvatar(@Body() body: { userId: string, avatarBase64: string }) {
    return this.authService.updateAvatar(body.userId, body.avatarBase64);
  }
  @Post('update-profile')
  updateProfile(@Body() body: { userId: string, newEmail?: string, newPassword?: string, newName?: string }) {
    return this.authService.updateProfile(body.userId, body.newEmail, body.newPassword, body.newName);
  }

  @Post('admin-reset-password')
  adminResetPassword(@Body() body: { adminId: string, targetEmail: string, newPassword?: string }) {
    return this.authService.adminResetPassword(body.adminId, body.targetEmail, body.newPassword || 'admin123');
  }
}
