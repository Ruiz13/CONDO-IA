import { Controller, Get, Post, Body, Param, Delete, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CommunicationsService } from './communications.service';

@Controller('api/communications')
export class CommunicationsController {
  constructor(private readonly commsService: CommunicationsService) {}

  @Post('announcements/upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        cb(null, `announcement-${uniqueSuffix}${ext}`);
      }
    })
  }))
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new Error('No file uploaded');
    }
    // Devolvemos la ruta relativa para accederla a través de express.static
    return { imageUrl: `/uploads/${file.filename}` };
  }

  @Post('announcements')
  createAnnouncement(@Body() body: { tenantId: string, title: string, content: string, imageUrl?: string }) {
    return this.commsService.createAnnouncement(body.tenantId, body.title, body.content, body.imageUrl);
  }

  @Get('announcements/:tenantId')
  getAnnouncements(@Param('tenantId') tenantId: string) {
    return this.commsService.getAnnouncements(tenantId);
  }

  @Delete('announcements/:id')
  deleteAnnouncement(@Param('id') id: string) {
    return this.commsService.deleteAnnouncement(id);
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
