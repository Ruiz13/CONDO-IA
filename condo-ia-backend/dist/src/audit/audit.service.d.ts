import { PrismaService } from '../prisma.service';
export declare class AuditService {
    private prisma;
    constructor(prisma: PrismaService);
    getAuditLogs(): Promise<({
        user: {
            email: string;
            role: string;
        };
    } & {
        id: string;
        tenantId: string;
        userId: string;
        action: string;
        tableName: string;
        oldData: string | null;
        newData: string | null;
        timestamp: Date;
    })[]>;
}
