import { InvoicesService } from './invoices.service';
export declare class InvoicesController {
    private readonly invoicesService;
    constructor(invoicesService: InvoicesService);
    triggerGenerationManual(): Promise<{
        success: boolean;
        message: string;
    }>;
    getMyReceipts(req: any): Promise<{
        id: string;
        tenantId: string;
        unitId: string;
        month: number;
        year: number;
        totalAmount: number;
        status: string;
        createdAt: Date;
    }[]>;
    getPendingInvoices(userId: string): Promise<({
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
        tenantId: string;
        unitId: string;
        month: number;
        year: number;
        totalAmount: number;
        status: string;
        createdAt: Date;
    })[]>;
}
