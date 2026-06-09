import { PaymentsService } from './payments.service';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    getPendingPayments(): Promise<({
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
        receiptUrl: string | null;
    })[]>;
    approvePayment(id: string, adminId: string): Promise<({
        unit: {
            owner: {
                id: string;
                createdAt: Date;
                tenantId: string | null;
                email: string;
                passwordHash: string;
                role: string;
                mustChangePassword: boolean;
                avatarBase64: string | null;
            };
        } & {
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
        receiptUrl: string | null;
    }) | null>;
    extractOcrData(base64Image: string): Promise<any>;
    reportPayment(body: {
        unitId: string;
        amount: number;
        referenceNumber: string;
        receiptBase64?: string;
    }): Promise<{
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
    }>;
    getUserPayments(userId: string): Promise<({
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
        receiptUrl: string | null;
    })[]>;
}
