import { KnowledgeService } from './knowledge.service';
export declare class KnowledgeController {
    private readonly knowledgeService;
    constructor(knowledgeService: KnowledgeService);
    uploadDocument(tenantId: string, file: Express.Multer.File): Promise<{
        id: string;
        createdAt: Date;
        tenantId: string;
        title: string;
        content: string;
    }>;
    addTextDocument(tenantId: string, body: {
        title: string;
        content: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        tenantId: string;
        title: string;
        content: string;
    } | {
        error: boolean;
        message: any;
        stack: any;
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
}
