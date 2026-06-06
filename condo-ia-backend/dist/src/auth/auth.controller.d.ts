import { AuthService } from './auth.service';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(body: any): Promise<{
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
    changePassword(body: any): Promise<{
        success: boolean;
        message: string;
    }>;
    updateAvatar(body: {
        userId: string;
        avatarBase64: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    updateProfile(body: {
        userId: string;
        newEmail?: string;
        newPassword?: string;
    }): Promise<{
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
    adminResetPassword(body: {
        adminId: string;
        targetEmail: string;
        newPassword?: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
}
