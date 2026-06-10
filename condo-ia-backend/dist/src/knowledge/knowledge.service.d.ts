import { PrismaService } from '../prisma.service';
export declare class KnowledgeService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    uploadDocument(tenantId: string, file: Express.Multer.File): Promise<{
        id: string;
        createdAt: Date;
        tenantId: string;
        title: string;
        content: string;
    }>;
    addTextDocument(tenantId: string, title: string, content: string): Promise<{
        id: string;
        createdAt: Date;
        tenantId: string;
        title: string;
        content: string;
    }>;
    getDocuments(tenantId: string): Promise<{
        id: string;
        createdAt: Date;
        title: string;
    }[]>;
    deleteDocument(id: string): Promise<{
        id: string;
        createdAt: Date;
        tenantId: string;
        title: string;
        content: string;
    }>;
    getTenantContext(tenantId: string): Promise<string>;
}
