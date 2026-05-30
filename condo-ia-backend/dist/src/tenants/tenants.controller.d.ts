import { TenantsService } from './tenants.service';
export declare class TenantsController {
    private readonly tenantsService;
    constructor(tenantsService: TenantsService);
    onboardTenant(body: {
        name: string;
        floors: number;
        aptsPerFloor: number;
        locales: number;
        aptAliquot: number;
        apiKey?: string;
    }): Promise<{
        success: boolean;
        message: string;
        tenantId: string;
        adminEmail: string;
        totalApts: number;
        totalLocales: number;
    }>;
}
