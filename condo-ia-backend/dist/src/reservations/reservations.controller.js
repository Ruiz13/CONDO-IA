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
exports.ReservationsController = void 0;
const common_1 = require("@nestjs/common");
const reservations_service_1 = require("./reservations.service");
let ReservationsController = class ReservationsController {
    reservationsService;
    constructor(reservationsService) {
        this.reservationsService = reservationsService;
    }
    async createReservation(body) {
        if (!body.area || !body.date) {
            throw new common_1.BadRequestException('Faltan datos de la reserva');
        }
        let unitId = body.unitId;
        if (body.role === 'OWNER') {
            const units = await this.reservationsService.getUnitsByOwner(body.tenantId, body.userId);
            if (units.length === 0) {
                throw new common_1.ForbiddenException('No tienes unidades asignadas');
            }
            unitId = units[0].id;
        }
        if (!unitId) {
            throw new common_1.BadRequestException('unitId es requerido');
        }
        return this.reservationsService.createReservation(body.tenantId, unitId, body.area, new Date(body.date));
    }
    async getReservations(role, tenantId, userId) {
        if (role === 'OWNER') {
            const units = await this.reservationsService.getUnitsByOwner(tenantId, userId);
            if (units.length === 0)
                return [];
            return this.reservationsService.getReservationsByUnit(tenantId, units[0].id);
        }
        return this.reservationsService.getAllReservations(tenantId);
    }
    async updateStatus(body, id, status) {
        if (body.role !== 'SUPER_ADMIN' && body.role !== 'ADMIN') {
            throw new common_1.ForbiddenException('Solo los administradores pueden cambiar el estado');
        }
        return this.reservationsService.updateStatus(body.tenantId, id, status);
    }
};
exports.ReservationsController = ReservationsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReservationsController.prototype, "createReservation", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('role')),
    __param(1, (0, common_1.Query)('tenantId')),
    __param(2, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ReservationsController.prototype, "getReservations", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], ReservationsController.prototype, "updateStatus", null);
exports.ReservationsController = ReservationsController = __decorate([
    (0, common_1.Controller)('reservations'),
    __metadata("design:paramtypes", [reservations_service_1.ReservationsService])
], ReservationsController);
//# sourceMappingURL=reservations.controller.js.map