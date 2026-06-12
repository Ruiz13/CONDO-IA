import { PrismaService } from '../prisma.service';
import { KnowledgeService } from '../knowledge/knowledge.service';
export declare class ChatService {
    private prisma;
    private knowledgeService;
    private readonly logger;
    private genAI;
    constructor(prisma: PrismaService, knowledgeService: KnowledgeService);
    getAiResponse(userMessage: string, userId?: string): Promise<string>;
    getChatHistory(userId: string): Promise<{
        id: string;
        tenantId: string | null;
        userId: string | null;
        text: string;
        isBot: boolean;
        createdAt: Date;
    }[]>;
    getAuditHistory(tenantId: string): Promise<({
        user: {
            email: string;
        } | null;
    } & {
        id: string;
        tenantId: string | null;
        userId: string | null;
        text: string;
        isBot: boolean;
        createdAt: Date;
    })[]>;
    cleanupOldMessages(): Promise<void>;
}
