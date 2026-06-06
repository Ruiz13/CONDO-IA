import { PrismaService } from '../prisma.service';
import { PdfService } from '../pdf/pdf.service';
import { EmailService } from '../email/email.service';
export declare class BillingService {
    private prisma;
    private pdfService;
    private emailService;
    private readonly logger;
    constructor(prisma: PrismaService, pdfService: PdfService, emailService: EmailService);
    generateMonthlyBilling(tenantId: string): Promise<{
        message: string;
    }>;
    processAllTenantsMonthlyBilling(): Promise<void>;
}
