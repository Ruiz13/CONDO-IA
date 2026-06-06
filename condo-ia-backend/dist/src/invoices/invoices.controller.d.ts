import { InvoicesService } from './invoices.service';
export declare class InvoicesController {
    private readonly invoicesService;
    constructor(invoicesService: InvoicesService);
    triggerGenerationManual(): Promise<{
        success: boolean;
        message: string;
    }>;
    getMyReceipts(userId: string): Promise<{
        id: string;
        createdAt: Date;
        tenantId: string;
        unitId: string;
        month: number;
        year: number;
        totalAmount: number;
        amountPaid: number;
        status: string;
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
        createdAt: Date;
        tenantId: string;
        unitId: string;
        month: number;
        year: number;
        totalAmount: number;
        amountPaid: number;
        status: string;
    })[]>;
}
