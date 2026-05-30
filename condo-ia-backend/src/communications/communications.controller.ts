import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { CommunicationsService } from './communications.service';

@Controller('api/communications')
export class CommunicationsController {
  constructor(private readonly commsService: CommunicationsService) {}

  @Post('announcements')
  createAnnouncement(@Body() body: { tenantId: string, title: string, content: string }) {
    return this.commsService.createAnnouncement(body.tenantId, body.title, body.content);
  }

  @Get('announcements/:tenantId')
  getAnnouncements(@Param('tenantId') tenantId: string) {
    return this.commsService.getAnnouncements(tenantId);
  }

  @Post('polls')
  createPoll(@Body() body: { tenantId: string, question: string, options: string[] }) {
    return this.commsService.createPoll(body.tenantId, body.question, body.options);
  }

  @Get('polls/:tenantId')
  getPolls(@Param('tenantId') tenantId: string) {
    return this.commsService.getPolls(tenantId);
  }

  @Post('polls/:pollId/vote')
  vote(@Param('pollId') pollId: string, @Body() body: { optionId: string, userId: string }) {
    return this.commsService.vote(pollId, body.optionId, body.userId);
  }
}
