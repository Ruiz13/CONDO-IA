import { Controller, Get, Post, Body, Patch, Param, Request, ForbiddenException, BadRequestException, Query } from '@nestjs/common';
import { ReservationsService } from './reservations.service';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  async createReservation(@Body() body: { area: string, date: string, tenantId: string, role: string, userId?: string, unitId?: string }) {
    if (!body.area || !body.date) {
      throw new BadRequestException('Faltan datos de la reserva');
    }
    
    // Solo un propietario puede reservar, o un admin en nombre de un propietario
    let unitId = body.unitId;
    if (body.role === 'OWNER') {
      const units = await this.reservationsService.getUnitsByOwner(body.tenantId, body.userId!);
      if (units.length === 0) {
        throw new ForbiddenException('No tienes unidades asignadas');
      }
      unitId = units[0].id;
    }

    if (!unitId) {
      throw new BadRequestException('unitId es requerido');
    }

    return this.reservationsService.createReservation(body.tenantId, unitId, body.area, new Date(body.date));
  }

  @Get()
  async getReservations(@Query('role') role: string, @Query('tenantId') tenantId: string, @Query('userId') userId: string) {
    if (role === 'OWNER') {
      const units = await this.reservationsService.getUnitsByOwner(tenantId, userId);
      if (units.length === 0) return [];
      return this.reservationsService.getReservationsByUnit(tenantId, units[0].id);
    }
    return this.reservationsService.getAllReservations(tenantId);
  }

  @Patch(':id/status')
  async updateStatus(@Body() body: { role: string, tenantId: string }, @Param('id') id: string, @Body('status') status: string) {
    if (body.role !== 'SUPER_ADMIN' && body.role !== 'ADMIN') {
      throw new ForbiddenException('Solo los administradores pueden cambiar el estado');
    }
    return this.reservationsService.updateStatus(body.tenantId, id, status);
  }
}
