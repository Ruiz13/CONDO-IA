import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReservationsService {
  constructor(private prisma: PrismaService) {}

  async getUnitsByOwner(tenantId: string, ownerId: string) {
    return this.prisma.unit.findMany({
      where: { tenantId, ownerId }
    });
  }

  async checkDebt(tenantId: string, unitId: string): Promise<boolean> {
    // Buscar facturas pendientes o parciales
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

  async createReservation(tenantId: string, unitId: string, area: string, date: Date) {
    // 1. Verificar si el usuario tiene deuda
    const hasDebt = await this.checkDebt(tenantId, unitId);
    if (hasDebt) {
      throw new BadRequestException('No puede reservar áreas comunes porque presenta deuda o morosidad.');
    }

    // 2. Verificar si ya hay una reserva aprobada en esa fecha para esa área
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
      throw new BadRequestException('El área ya está reservada y aprobada para esta fecha.');
    }

    // 3. Crear reserva
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

  async getAllReservations(tenantId: string) {
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

  async getReservationsByUnit(tenantId: string, unitId: string) {
    return this.prisma.reservation.findMany({
      where: { tenantId, unitId },
      orderBy: { date: 'desc' }
    });
  }

  async updateStatus(tenantId: string, reservationId: string, status: string) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId }
    });

    if (!reservation || reservation.tenantId !== tenantId) {
      throw new NotFoundException('Reserva no encontrada');
    }

    return this.prisma.reservation.update({
      where: { id: reservationId },
      data: { status }
    });
  }
}
