import { ChatService } from './chat.service';
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    handleChat(message: string): Promise<{
        response: string;
    }>;
}
