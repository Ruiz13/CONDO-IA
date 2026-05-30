import { Controller, Post, Body } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('api/chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async handleChat(@Body('message') message: string, @Body('userId') userId: string) {
    if (!message) {
      return { response: '🤖 Por favor, escríbeme algo para poder ayudarte.' };
    }
    const reply = await this.chatService.getAiResponse(message, userId);
    return { response: reply };
  }
}
