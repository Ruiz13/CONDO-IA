import { Controller, Post, Param } from '@nestjs/common';
import { BillingService } from './billing.service';

@Controller('api/billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post('generate/:tenantId')
  async generateBilling(@Param('tenantId') tenantId: string) {
    return this.billingService.generateMonthlyBilling(tenantId);
  }
}
