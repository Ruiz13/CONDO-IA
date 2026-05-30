import { AuditService } from './audit.service';
export declare class AuditController {
    private readonly auditService;
    constructor(auditService: AuditService);
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
