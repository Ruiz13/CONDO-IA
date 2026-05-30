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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunicationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let CommunicationsService = class CommunicationsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createAnnouncement(tenantId, title, content) {
        return this.prisma.announcement.create({
            data: { tenantId, title, content }
        });
    }
    async getAnnouncements(tenantId) {
        return this.prisma.announcement.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' }
        });
    }
    async createPoll(tenantId, question, options) {
        return this.prisma.poll.create({
            data: {
                tenantId,
                question,
                options: {
                    create: options.map(opt => ({ text: opt }))
                }
            }
        });
    }
    async getPolls(tenantId) {
        return this.prisma.poll.findMany({
            where: { tenantId },
            include: {
                options: {
                    include: { _count: { select: { votes: true } } }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    async vote(pollId, optionId, userId) {
        return this.prisma.vote.create({
            data: { pollId, optionId, userId }
        });
    }
};
exports.CommunicationsService = CommunicationsService;
exports.CommunicationsService = CommunicationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CommunicationsService);
//# sourceMappingURL=communications.service.js.map