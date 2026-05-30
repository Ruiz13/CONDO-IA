import { PrismaService } from '../prisma.service';
export declare class ChatService {
    private prisma;
    private readonly logger;
    private genAI;
    constructor(prisma: PrismaService);
    getAiResponse(userMessage: string): Promise<string>;
}
