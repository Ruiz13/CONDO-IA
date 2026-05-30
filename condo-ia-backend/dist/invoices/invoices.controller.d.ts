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
        createdAt: Date;
        tenantId: string;
        unitId: string;
        month: number;
        year: number;
        totalAmount: number;
        status: string;
    }[]>;
}
