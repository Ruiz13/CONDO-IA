import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import pdfParse from 'pdf-parse';

@Injectable()
export class KnowledgeService {
  private readonly logger = new Logger(KnowledgeService.name);

  constructor(private prisma: PrismaService) {}

  async uploadDocument(tenantId: string, file: Express.Multer.File) {
    let content = '';
    
    try {
      if (file.mimetype === 'application/pdf') {
        const data = await pdfParse(file.buffer);
        content = data.text;
      } else if (file.mimetype === 'text/plain') {
        content = file.buffer.toString('utf-8');
      } else {
        throw new Error('Formato de archivo no soportado. Usa PDF o TXT.');
      }

      if (!content || content.trim().length === 0) {
        throw new Error('No se pudo extraer texto del archivo.');
      }

      const doc = await this.prisma.knowledgeDocument.create({
        data: {
          tenantId,
          title: file.originalname,
          content: content.trim()
        }
      });
      return doc;
    } catch (e) {
      this.logger.error('Error procesando archivo', e);
      throw e;
    }
  }

  async addTextDocument(tenantId: string, title: string, content: string) {
    if (!content || content.trim().length === 0) {
      throw new Error('El contenido no puede estar vacío.');
    }
    const doc = await this.prisma.knowledgeDocument.create({
      data: {
        tenantId,
        title,
        content: content.trim()
      }
    });
    return doc;
  }

  async getDocuments(tenantId: string) {
    return this.prisma.knowledgeDocument.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        createdAt: true,
        // No devolvemos el content aquí para no saturar la red en el listado
      }
    });
  }

  async deleteDocument(id: string) {
    return this.prisma.knowledgeDocument.delete({
      where: { id }
    });
  }

  // Método usado por el ChatService para inyectar contexto
  async getTenantContext(tenantId: string): Promise<string> {
    const docs = await this.prisma.knowledgeDocument.findMany({
      where: { tenantId }
    });
    
    if (docs.length === 0) return '';
    
    let context = '--- DOCUMENTOS OFICIALES DEL EDIFICIO ---\n\n';
    for (const doc of docs) {
      context += `[Documento: ${doc.title}]\n${doc.content}\n\n`;
    }
    context += '--- FIN DE DOCUMENTOS ---\n';
    return context;
  }
}
