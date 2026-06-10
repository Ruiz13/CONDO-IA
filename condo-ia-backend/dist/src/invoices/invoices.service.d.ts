import { PrismaService } from '../prisma.service';
import { EmailService } from '../email/email.service';
export declare class InvoicesService {
    private prisma;
    private emailService;
    private readonly logger;
    constructor(prisma: PrismaService, emailService: EmailService);
    generateMonthlyInvoices(): Promise<void>;
    getMyReceipts(userId: string): Promise<{
        id: string;
        createdAt: Date;
        tenantId: string;
        unitId: string;
        month: number;
        year: number;
        totalAmount: number;
        amountPaid: number;
        status: string;
    }[]>;
    getPendingInvoices(userId: string): Promise<({
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
        month: number;
        year: number;
        totalAmount: number;
        amountPaid: number;
        status: string;
    })[]>;
}
