import { PrismaService } from '../prisma.service';
import { EmailService } from '../email/email.service';
export declare class PaymentsService {
    private prisma;
    private emailService;
    private readonly logger;
    private genAI;
    constructor(prisma: PrismaService, emailService: EmailService);
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
    approvePayment(id: string, adminId?: string): Promise<({
        unit: {
            owner: {
                id: string;
                tenantId: string | null;
                createdAt: Date;
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
    reportPayment(data: {
        unitId: string;
        amount: number;
        referenceNumber: string;
        ocrConfidence?: number;
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
    reconcileTransactions(bankTransactions: Array<{
        date?: string;
        description?: string;
        referenceNumber: string;
        amount: number;
    }>, adminId?: string): Promise<{
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
        })[];
    }>;
}
