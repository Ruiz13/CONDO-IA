import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('api/payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('pending')
  getPendingPayments() {
    return this.paymentsService.getPendingPayments();
  }

  @Post(':id/approve')
  approvePayment(@Param('id') id: string, @Body('adminId') adminId: string) {
    return this.paymentsService.approvePayment(id, adminId);
  }

  @Post('ocr')
  extractOcrData(@Body('base64Image') base64Image: string) {
    return this.paymentsService.extractOcrData(base64Image);
  }

  @Post('report')
  reportPayment(@Body() body: { invoiceId: string, amount: number, referenceNumber: string }) {
    return this.paymentsService.reportPayment(body);
  }
}
