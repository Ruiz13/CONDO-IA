import { PrismaService } from '../prisma.service';
export declare class InvoicesService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    generateMonthlyInvoices(): Promise<void>;
    getMyReceipts(userId: string): Promise<{
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
    reportPayment(tenantId: string, invoiceId: string, amount: number, referenceNumber: string): Promise<{
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
