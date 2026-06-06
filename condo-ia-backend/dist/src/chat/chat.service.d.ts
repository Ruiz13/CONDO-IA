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
        createdAt: Date;
        tenantId: string | null;
        text: string;
        isBot: boolean;
        userId: string | null;
    }[]>;
    getAuditHistory(tenantId: string): Promise<({
        user: {
            email: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        tenantId: string | null;
        text: string;
        isBot: boolean;
        userId: string | null;
    })[]>;
}
