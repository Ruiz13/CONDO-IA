import { KnowledgeService } from './knowledge.service';
export declare class KnowledgeController {
    private readonly knowledgeService;
    constructor(knowledgeService: KnowledgeService);
    uploadDocument(tenantId: string, file: Express.Multer.File): Promise<{
        id: string;
        title: string;
        content: string;
        createdAt: Date;
        tenantId: string;
    }>;
    addTextDocument(tenantId: string, body: {
        title: string;
        content: string;
    }): Promise<{
        id: string;
        title: string;
        content: string;
        createdAt: Date;
        tenantId: string;
    } | {
        error: boolean;
        message: any;
        stack: any;
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
}
