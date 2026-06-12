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
        tenantId: string;
        unitId: string;
        amount: number;
        paymentMethod: string;
        referenceNumber: string | null;
        status: string;
        ocrConfidence: number | null;
        receiptUrl: string | null;
        createdAt: Date;
    })[]>;
    approvePayment(id: string, adminId: string): Promise<({
        unit: {
            owner: {
                id: string;
                tenantId: string | null;
                createdAt: Date;
                name: string | null;
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
        tenantId: string;
        unitId: string;
        amount: number;
        paymentMethod: string;
        referenceNumber: string | null;
        status: string;
        ocrConfidence: number | null;
        receiptUrl: string | null;
        createdAt: Date;
    }) | null>;
    extractOcrData(base64Image: string): Promise<any>;
    reportPayment(body: {
        unitId: string;
        amount: number;
        referenceNumber: string;
        receiptBase64?: string;
    }): Promise<{
        id: string;
        tenantId: string;
        unitId: string;
        amount: number;
        paymentMethod: string;
        referenceNumber: string | null;
        status: string;
        ocrConfidence: number | null;
        receiptUrl: string | null;
        createdAt: Date;
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
        tenantId: string;
        unitId: string;
        amount: number;
        paymentMethod: string;
        referenceNumber: string | null;
        status: string;
        ocrConfidence: number | null;
        receiptUrl: string | null;
        createdAt: Date;
    })[]>;
}
