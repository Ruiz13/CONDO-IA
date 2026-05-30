import { ChatService } from './chat.service';
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    handleChat(message: string, userId: string): Promise<{
        response: string;
    }>;
}
