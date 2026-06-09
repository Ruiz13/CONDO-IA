import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request, ForbiddenException, BadRequestException } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('reservations')
@UseGuards(JwtAuthGuard)
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  async createReservation(@Request() req, @Body() body: { area: string, date: string }) {
    if (!body.area || !body.date) {
      throw new BadRequestException('Faltan datos de la reserva');
    }
    
    // Solo un propietario puede reservar, o un admin en nombre de un propietario
    let unitId = body['unitId'];
    if (req.user.role === 'OWNER') {
      // Buscar la unidad del propietario
      const units = await this.reservationsService.getUnitsByOwner(req.user.tenantId, req.user.id);
      if (units.length === 0) {
        throw new ForbiddenException('No tienes unidades asignadas');
      }
      unitId = units[0].id; // Asignamos la primera unidad del propietario
    }

    if (!unitId) {
      throw new BadRequestException('unitId es requerido');
    }

    return this.reservationsService.createReservation(req.user.tenantId, unitId, body.area, new Date(body.date));
  }

  @Get()
  async getReservations(@Request() req) {
    // Si es propietario, solo ve sus reservas. Si es admin, ve todas las del edificio.
    if (req.user.role === 'OWNER') {
      const units = await this.reservationsService.getUnitsByOwner(req.user.tenantId, req.user.id);
      if (units.length === 0) return [];
      return this.reservationsService.getReservationsByUnit(req.user.tenantId, units[0].id);
    }
    return this.reservationsService.getAllReservations(req.user.tenantId);
  }

  @Patch(':id/status')
  async updateStatus(@Request() req, @Param('id') id: string, @Body('status') status: string) {
    if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Solo los administradores pueden cambiar el estado');
    }
    return this.reservationsService.updateStatus(req.user.tenantId, id, status);
  }
}
