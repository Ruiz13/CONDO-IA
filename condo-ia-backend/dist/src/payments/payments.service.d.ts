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
    })[]>;
    approvePayment(id: string, adminId?: string): Promise<({
        unit: {
            owner: {
                id: string;
                name: string | null;
                createdAt: Date;
                email: string;
                passwordHash: string;
                role: string;
                mustChangePassword: boolean;
                avatarBase64: string | null;
                tenantId: string | null;
            };
        } & {
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
    }>;
}
