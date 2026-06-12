import { PaymentsService } from './payments.service';
export declare class ReconciliationController {
    private readonly paymentsService;
    private readonly logger;
    private genAI;
    constructor(paymentsService: PaymentsService);
    parsePdfStatement(file: Express.Multer.File): Promise<{
        success: boolean;
        transactions: any[];
        error?: undefined;
        details?: undefined;
    } | {
        success: boolean;
        error: string;
        details: any;
        transactions?: undefined;
    }>;
    processReconciliation(body: {
        transactions: Array<{
            date?: string;
            description?: string;
            referenceNumber: string;
            amount: number;
        }>;
        adminId?: string;
    }): Promise<{
        matchedCount: number;
        unmatchedBankCount: number;
        unmatchedSystemCount: number;
        matched: {
            bankTx: any;
            payment: any;
        }[];
        unmatchedBank: any[];
        unmatchedSystem: ({
            unit: {
                id: string;
                tenantId: string;
                unitNumber: string;
                aliquotPercentage: number;
                isCommercial: boolean;
                ownerId: string;
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
            receiptUrl: string | null;
        })[];
        success: boolean;
        error?: undefined;
    } | {
        success: boolean;
        error: string;
    }>;
}
