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
        createdAt: Date;
    })[]>;
    version(): {
        version: string;
    };
    dbPush(): Promise<unknown>;
    createTenantWithAdmin(body: {
        tenantName: string;
        adminEmail: string;
        adminPassword: string;
    }): Promise<{
        success: boolean;
        message: string;
        tenantId: string;
    }>;
    getUnitsByTenant(tenantId: string): Promise<({
        invoices: {
            tenantId: string;
            id: string;
            createdAt: Date;
            unitId: string;
            month: number;
            year: number;
            totalAmount: number;
            amountPaid: number;
            status: string;
        }[];
        owner: {
            id: string;
            email: string;
        };
    } & {
        tenantId: string;
        id: string;
        ownerId: string;
        unitNumber: string;
        aliquotPercentage: number;
        isCommercial: boolean;
    })[]>;
    createUnitAndOwner(tenantId: string, body: {
        unitNumber: string;
        ownerEmail: string;
        ownerPassword: string;
        aliquotPercentage: number;
    }): Promise<{
        success: boolean;
        unit: {
            tenantId: string;
            id: string;
            ownerId: string;
            unitNumber: string;
            aliquotPercentage: number;
            isCommercial: boolean;
        };
    }>;
    deleteUnit(tenantId: string, unitId: string): Promise<{
        success: boolean;
        message: string;
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
                tenantId: string;
                id: string;
                ownerId: string;
                unitNumber: string;
                aliquotPercentage: number;
                isCommercial: boolean;
            };
        } & {
            tenantId: string;
            id: string;
            createdAt: Date;
            unitId: string;
            status: string;
            amount: number;
            ocrConfidence: number | null;
            paymentMethod: string;
            referenceNumber: string | null;
            receiptUrl: string | null;
        })[];
        expenses: {
            tenantId: string;
            id: string;
            amount: number;
            date: Date;
            description: string;
            isExtraordinary: boolean;
            expenseCategory: string;
            appliesTo: string;
            isBilled: boolean;
            providerName: string | null;
            providerInvoice: string | null;
        }[];
    }>;
    deleteTenant(tenantId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    toggleTenantStatus(tenantId: string): Promise<{
        id: string;
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
        createdAt: Date;
    }>;
    resetAdminPassword(tenantId: string): Promise<{
        success: boolean;
        message: string;
    } | {
        debugError: boolean;
        message: any;
        stack: any;
    }>;
    updateTenantLogo(tenantId: string, body: {
        logoBase64: string;
    }): Promise<{
        message: string;
    }>;
    updateTenantSettings(tenantId: string, body: {
        rif?: string;
        address?: string;
        phone?: string;
        city?: string;
        state?: string;
        country?: string;
    }): Promise<{
        message: string;
    }>;
    clearFinances(tenantId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    resetAllResidentPasswords(): Promise<{
        success: boolean;
        updated: number;
        newPassword: string;
    }>;
    debugUsers(): Promise<{
        total: number;
        users: {
            tenant: {
                name: string;
                isActive: boolean;
            } | null;
            role: string;
            email: string;
        }[];
    }>;
    reactivateAllTenants(): Promise<{
        success: boolean;
        reactivated: number;
        tenants: {
            id: string;
            name: string;
            isActive: boolean;
        }[];
    }>;
}
