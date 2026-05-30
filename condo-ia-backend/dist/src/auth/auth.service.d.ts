import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';
export declare class AuthService {
    private prisma;
    private jwtService;
    private readonly logger;
    constructor(prisma: PrismaService, jwtService: JwtService);
    login(email: string, passwordHash: string): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            role: string;
            tenantId: string;
            mustChangePassword: boolean;
        };
    }>;
    changePassword(userId: string, newPasswordHash: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
