import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  login(@Body() body: any) {
    return this.authService.login(body.email, body.password);
  }

  @Post('change-password')
  changePassword(@Body() body: any) {
    // Para simplificar el MVP, pasamos el userId directamente en el body
    // En producción se sacaría del token JWT con un Guard
    return this.authService.changePassword(body.userId, body.newPassword);
  }
}
