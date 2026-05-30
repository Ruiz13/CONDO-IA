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
const communications_service_1 = require("./communications.service");
let CommunicationsController = class CommunicationsController {
    commsService;
    constructor(commsService) {
        this.commsService = commsService;
    }
    createAnnouncement(body) {
        return this.commsService.createAnnouncement(body.tenantId, body.title, body.content);
    }
    getAnnouncements(tenantId) {
        return this.commsService.getAnnouncements(tenantId);
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