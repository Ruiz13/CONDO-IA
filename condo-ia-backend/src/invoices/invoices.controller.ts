import { Controller, Get, Post, Request, Param } from '@nestjs/common';
import { InvoicesService } from './invoices.service';

@Controller('api/invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post('generate-monthly')
  async triggerGenerationManual() {
    // Permite al Administrador forzar la generación antes del día 3
    await this.invoicesService.generateMonthlyInvoices();
    return { success: true, message: 'Facturación iniciada.' };
  }

  @Get('user/:userId')
  async getMyReceipts(@Param('userId') userId: string) {
    return this.invoicesService.getMyReceipts(userId);
  }

  @Get('pending/:userId')
  async getPendingInvoices(@Param('userId') userId: string) {
    return this.invoicesService.getPendingInvoices(userId);
  }
}
