import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ExpensesService } from './expenses.service';

@Controller('api/expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  createExpense(@Body() body: { tenantId: string, description: string, amount: number, appliesTo: string, providerName?: string, providerInvoice?: string }) {
    return this.expensesService.createExpense(body.tenantId, body.description, body.amount, body.appliesTo, body.providerName, body.providerInvoice);
  }

  @Get(':tenantId')
  getExpenses(@Param('tenantId') tenantId: string) {
    return this.expensesService.getExpenses(tenantId);
  }
}
