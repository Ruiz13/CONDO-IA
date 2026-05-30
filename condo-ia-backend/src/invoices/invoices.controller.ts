import { Controller, Get, Post, Request } from '@nestjs/common';
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

  @Get('my-receipts')
  async getMyReceipts(@Request() req: any) {
    // req.user.id vendría inyectado por el AuthGuard (JWT)
    const mockUserId = 'user-123'; 
    return this.invoicesService.getMyReceipts(mockUserId);
  }
}
