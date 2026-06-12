import { ChatService } from './chat.service';
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    handleChat(message: string, userId: string): Promise<{
        response: string;
    }>;
    getHistory(userId: string): Promise<{
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
