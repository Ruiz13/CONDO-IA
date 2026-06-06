import { Controller, Post, Get, Delete, Param, Body, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { KnowledgeService } from './knowledge.service';

@Controller('api/knowledge')
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Post(':tenantId/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @Param('tenantId') tenantId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new Error('No se envió ningún archivo');
    return this.knowledgeService.uploadDocument(tenantId, file);
  }

  @Post(':tenantId/text')
  async addTextDocument(
    @Param('tenantId') tenantId: string,
    @Body() body: { title: string, content: string }
  ) {
    try {
      return await this.knowledgeService.addTextDocument(tenantId, body.title, body.content);
    } catch (e: any) {
      return { error: true, message: e.message, stack: e.stack };
    }
  }

  @Get(':tenantId')
  async getDocuments(@Param('tenantId') tenantId: string) {
    return this.knowledgeService.getDocuments(tenantId);
  }

  @Delete(':id')
  async deleteDocument(@Param('id') id: string) {
    return this.knowledgeService.deleteDocument(id);
  }
}
