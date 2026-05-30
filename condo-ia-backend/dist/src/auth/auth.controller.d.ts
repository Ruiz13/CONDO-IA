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
            tenantId: string;
            mustChangePassword: boolean;
        };
    }>;
    changePassword(body: any): Promise<{
        success: boolean;
        message: string;
    }>;
}
