import { ChatService } from './chat.service';
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    handleChat(message: string, userId: string): Promise<{
        response: string;
    }>;
    getHistory(userId: string): Promise<{
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
}
