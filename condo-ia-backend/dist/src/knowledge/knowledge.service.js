"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var KnowledgeService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowledgeService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const pdf_parse_1 = __importDefault(require("pdf-parse"));
let KnowledgeService = KnowledgeService_1 = class KnowledgeService {
    prisma;
    logger = new common_1.Logger(KnowledgeService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async uploadDocument(tenantId, file) {
        let content = '';
        try {
            if (file.mimetype === 'application/pdf') {
                const data = await (0, pdf_parse_1.default)(file.buffer);
                content = data.text;
            }
            else if (file.mimetype === 'text/plain') {
                content = file.buffer.toString('utf-8');
            }
            else {
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
        }
        catch (e) {
            this.logger.error('Error procesando archivo', e);
            throw e;
        }
    }
    async addTextDocument(tenantId, title, content) {
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
    async getDocuments(tenantId) {
        return this.prisma.knowledgeDocument.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                title: true,
                createdAt: true,
            }
        });
    }
    async deleteDocument(id) {
        return this.prisma.knowledgeDocument.delete({
            where: { id }
        });
    }
    async getTenantContext(tenantId) {
        const docs = await this.prisma.knowledgeDocument.findMany({
            where: { tenantId }
        });
        if (docs.length === 0)
            return '';
        let context = '--- DOCUMENTOS OFICIALES DEL EDIFICIO ---\n\n';
        for (const doc of docs) {
            context += `[Documento: ${doc.title}]\n${doc.content}\n\n`;
        }
        context += '--- FIN DE DOCUMENTOS ---\n';
        return context;
    }
};
exports.KnowledgeService = KnowledgeService;
exports.KnowledgeService = KnowledgeService = KnowledgeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], KnowledgeService);
//# sourceMappingURL=knowledge.service.js.map