import { PaymentsService } from './payments.service';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    getPendingPayments(): Promise<({
        invoice: {
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
        };
    } & {
        id: string;
        tenantId: string;
        status: string;
        createdAt: Date;
        amount: number;
        paymentMethod: string;
        referenceNumber: string | null;
        ocrConfidence: number | null;
        invoiceId: string;
    })[]>;
    approvePayment(id: string, adminId: string): Promise<{
        id: string;
        tenantId: string;
        status: string;
        createdAt: Date;
        amount: number;
        paymentMethod: string;
        referenceNumber: string | null;
        ocrConfidence: number | null;
        invoiceId: string;
    }>;
    extractOcrData(base64Image: string): Promise<any>;
    reportPayment(body: {
        invoiceId: string;
        amount: number;
        referenceNumber: string;
    }): Promise<{
        id: string;
        tenantId: string;
        status: string;
        createdAt: Date;
        amount: number;
        paymentMethod: string;
        referenceNumber: string | null;
        ocrConfidence: number | null;
        invoiceId: string;
    }>;
}
