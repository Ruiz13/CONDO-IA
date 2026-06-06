import { PrismaService } from '../prisma.service';
export declare class KnowledgeService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    uploadDocument(tenantId: string, file: Express.Multer.File): Promise<{
        id: string;
        title: string;
        content: string;
        createdAt: Date;
        tenantId: string;
    }>;
    addTextDocument(tenantId: string, title: string, content: string): Promise<{
        id: string;
        title: string;
        content: string;
        createdAt: Date;
        tenantId: string;
    }>;
    getDocuments(tenantId: string): Promise<{
        id: string;
        title: string;
        createdAt: Date;
    }[]>;
    deleteDocument(id: string): Promise<{
        id: string;
        title: string;
        content: string;
        createdAt: Date;
        tenantId: string;
    }>;
    getTenantContext(tenantId: string): Promise<string>;
}
