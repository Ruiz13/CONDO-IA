import { PrismaService } from '../prisma.service';
export declare class TenantsService {
    private prisma;
    constructor(prisma: PrismaService);
    onboardTenant(data: {
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
