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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunicationsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const communications_service_1 = require("./communications.service");
let CommunicationsController = class CommunicationsController {
    commsService;
    constructor(commsService) {
        this.commsService = commsService;
    }
    uploadImage(file) {
        if (!file) {
            throw new Error('No file uploaded');
        }
        return { imageUrl: `/uploads/${file.filename}` };
    }
    createAnnouncement(body) {
        return this.commsService.createAnnouncement(body.tenantId, body.title, body.content, body.imageUrl);
    }
    getAnnouncements(tenantId) {
        return this.commsService.getAnnouncements(tenantId);
    }
    deleteAnnouncement(id) {
        return this.commsService.deleteAnnouncement(id);
    }
    createPoll(body) {
        return this.commsService.createPoll(body.tenantId, body.question, body.options);
    }
    getPolls(tenantId) {
        return this.commsService.getPolls(tenantId);
    }
    vote(pollId, body) {
        return this.commsService.vote(pollId, body.optionId, body.userId);
    }
};
exports.CommunicationsController = CommunicationsController;
__decorate([
    (0, common_1.Post)('announcements/upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads',
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                const ext = (0, path_1.extname)(file.originalname);
                cb(null, `announcement-${uniqueSuffix}${ext}`);
            }
        })
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CommunicationsController.prototype, "uploadImage", null);
__decorate([
    (0, common_1.Post)('announcements'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CommunicationsController.prototype, "createAnnouncement", null);
__decorate([
    (0, common_1.Get)('announcements/:tenantId'),
    __param(0, (0, common_1.Param)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CommunicationsController.prototype, "getAnnouncements", null);
__decorate([
    (0, common_1.Delete)('announcements/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CommunicationsController.prototype, "deleteAnnouncement", null);
__decorate([
    (0, common_1.Post)('polls'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CommunicationsController.prototype, "createPoll", null);
__decorate([
    (0, common_1.Get)('polls/:tenantId'),
    __param(0, (0, common_1.Param)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CommunicationsController.prototype, "getPolls", null);
__decorate([
    (0, common_1.Post)('polls/:pollId/vote'),
    __param(0, (0, common_1.Param)('pollId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CommunicationsController.prototype, "vote", null);
exports.CommunicationsController = CommunicationsController = __decorate([
    (0, common_1.Controller)('api/communications'),
    __metadata("design:paramtypes", [communications_service_1.CommunicationsService])
], CommunicationsController);
//# sourceMappingURL=communications.controller.js.map