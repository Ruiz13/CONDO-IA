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
exports.ReservationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let ReservationsService = class ReservationsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getUnitsByOwner(tenantId, ownerId) {
        return this.prisma.unit.findMany({
            where: { tenantId, ownerId }
        });
    }
    async checkDebt(tenantId, unitId) {
        const pendingInvoices = await this.prisma.invoice.findMany({
            where: {
                tenantId,
                unitId,
                status: { in: ['PENDING', 'PARTIAL'] }
            }
        });
        const totalDebt = pendingInvoices.reduce((sum, inv) => sum + (inv.totalAmount - inv.amountPaid), 0);
        return totalDebt > 0;
    }
    async createReservation(tenantId, unitId, area, date) {
        const hasDebt = await this.checkDebt(tenantId, unitId);
        if (hasDebt) {
            throw new common_1.BadRequestException('No puede reservar áreas comunes porque presenta deuda o morosidad.');
        }
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        const existing = await this.prisma.reservation.findFirst({
            where: {
                tenantId,
                area,
                date: {
                    gte: startOfDay,
                    lte: endOfDay
                },
                status: 'APPROVED'
            }
        });
        if (existing) {
            throw new common_1.BadRequestException('El área ya está reservada y aprobada para esta fecha.');
        }
        return this.prisma.reservation.create({
            data: {
                tenantId,
                unitId,
                area,
                date,
                status: 'PENDING'
            },
            include: {
                unit: true
            }
        });
    }
    async getAllReservations(tenantId) {
        return this.prisma.reservation.findMany({
            where: { tenantId },
            include: {
                unit: {
                    include: { owner: { select: { email: true } } }
                }
            },
            orderBy: { date: 'desc' }
        });
    }
    async getReservationsByUnit(tenantId, unitId) {
        return this.prisma.reservation.findMany({
            where: { tenantId, unitId },
            orderBy: { date: 'desc' }
        });
    }
    async updateStatus(tenantId, reservationId, status) {
        const reservation = await this.prisma.reservation.findUnique({
            where: { id: reservationId }
        });
        if (!reservation || reservation.tenantId !== tenantId) {
            throw new common_1.NotFoundException('Reserva no encontrada');
        }
        return this.prisma.reservation.update({
            where: { id: reservationId },
            data: { status }
        });
    }
};
exports.ReservationsService = ReservationsService;
exports.ReservationsService = ReservationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReservationsService);
//# sourceMappingURL=reservations.service.js.map