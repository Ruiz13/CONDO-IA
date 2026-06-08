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
        address?: string;
        city?: string;
        state?: string;
        country?: string;
        phone?: string;
    }): Promise<{
        success: boolean;
        message: string;
        tenantId: string;
        adminEmail: string;
        totalApts: number;
        totalLocales: number;
    }>;
    getAllTenants(): Promise<({
        users: {
            email: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        name: string;
        geminiApiKey: string | null;
        isActive: boolean;
        logoBase64: string | null;
        rif: string | null;
        address: string | null;
        city: string | null;
        state: string | null;
        country: string | null;
        phone: string | null;
    })[]>;
    deleteTenant(tenantId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    toggleTenantStatus(tenantId: string): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        geminiApiKey: string | null;
        isActive: boolean;
        logoBase64: string | null;
        rif: string | null;
        address: string | null;
        city: string | null;
        state: string | null;
        country: string | null;
        phone: string | null;
    }>;
    updateTenantLogo(tenantId: string, logoBase64: string): Promise<{
        message: string;
    }>;
    updateTenantSettings(tenantId: string, data: {
        rif?: string;
        address?: string;
        phone?: string;
        city?: string;
        state?: string;
        country?: string;
    }): Promise<{
        message: string;
    }>;
    resetAdminPassword(tenantId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    createTenantWithAdmin(data: {
        tenantName: string;
        adminEmail: string;
        adminPassword: string;
    }): Promise<{
        success: boolean;
        message: string;
        tenantId: string;
    }>;
    getUnitsByTenant(tenantId: string): Promise<({
        owner: {
            id: string;
            email: string;
        };
        invoices: {
            id: string;
            createdAt: Date;
            tenantId: string;
            unitId: string;
            month: number;
            year: number;
            totalAmount: number;
            amountPaid: number;
            status: string;
        }[];
    } & {
        id: string;
        tenantId: string;
        ownerId: string;
        unitNumber: string;
        aliquotPercentage: number;
        isCommercial: boolean;
    })[]>;
    createUnitAndOwner(tenantId: string, unitNumber: string, ownerEmail: string, ownerPassword: string, aliquotPercentage: number): Promise<{
        success: boolean;
        unit: {
            id: string;
            tenantId: string;
            ownerId: string;
            unitNumber: string;
            aliquotPercentage: number;
            isCommercial: boolean;
        };
    }>;
    getTenantStats(tenantId: string): Promise<{
        ingresosDelMes: number;
        gastosDelMes: number;
        pagosPorAprobar: number;
        totalResidentes: number;
        morosidadData: {
            name: string;
            value: number;
        }[];
        consultasIA: {
            date: any;
            count: any;
        }[];
    }>;
    getFinancialReport(tenantId: string): Promise<{
        payments: ({
            unit: {
                id: string;
                tenantId: string;
                ownerId: string;
                unitNumber: string;
                aliquotPercentage: number;
                isCommercial: boolean;
            };
        } & {
            id: string;
            createdAt: Date;
            tenantId: string;
            unitId: string;
            status: string;
            amount: number;
            paymentMethod: string;
            referenceNumber: string | null;
            ocrConfidence: number | null;
        })[];
        expenses: {
            id: string;
            tenantId: string;
            amount: number;
            date: Date;
            description: string;
            isExtraordinary: boolean;
            expenseCategory: string;
            appliesTo: string;
            isBilled: boolean;
            providerName: string | null;
            providerInvoice: string | null;
            observation: string | null;
        }[];
    }>;
    deleteUnit(tenantId: string, unitId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    clearFinances(tenantId: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
