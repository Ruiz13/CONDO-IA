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
            tenantId: string | null;
            tenantName: string;
            mustChangePassword: boolean;
            avatarBase64: string | null;
        };
    }>;
    changePassword(userId: string, newPasswordHash: string): Promise<{
        success: boolean;
        message: string;
    }>;
    updateProfile(userId: string, newEmail?: string, newPassword?: string): Promise<{
        success: boolean;
        user: {
            id: string;
            email: string;
            role: string;
            tenantId: string | null;
            mustChangePassword: boolean;
            avatarBase64: string | null;
        };
    }>;
    updateAvatar(userId: string, avatarBase64: string): Promise<{
        success: boolean;
        message: string;
    }>;
    adminResetPassword(adminId: string, targetEmail: string, newPasswordPlain: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
