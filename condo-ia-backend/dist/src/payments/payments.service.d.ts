import { PrismaService } from '../prisma.service';
export declare class PaymentsService {
    private prisma;
    private readonly logger;
    private genAI;
    constructor(prisma: PrismaService);
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
    approvePayment(id: string, adminId?: string): Promise<{
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
    reportPayment(data: {
        invoiceId: string;
        amount: number;
        referenceNumber: string;
        ocrConfidence?: number;
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
