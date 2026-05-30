import { PrismaService } from '../prisma.service';
export declare class InvoicesService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    generateMonthlyInvoices(): Promise<void>;
    getMyReceipts(userId: string): Promise<{
        id: string;
        createdAt: Date;
        tenantId: string;
        unitId: string;
        month: number;
        year: number;
        totalAmount: number;
        status: string;
    }[]>;
    reportPayment(tenantId: string, invoiceId: string, amount: number, referenceNumber: string): Promise<{
        id: string;
        createdAt: Date;
        tenantId: string;
        status: string;
        amount: number;
        paymentMethod: string;
        referenceNumber: string | null;
        ocrConfidence: number | null;
        invoiceId: string;
    }>;
}
