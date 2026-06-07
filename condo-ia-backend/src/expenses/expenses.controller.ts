import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { ExpensesService } from './expenses.service';

@Controller('api/expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  createExpense(@Body() body: { tenantId: string, description: string, amount: number, appliesTo: string, providerName?: string, providerInvoice?: string, observation?: string }) {
    return this.expensesService.createExpense(body.tenantId, body.description, body.amount, body.appliesTo, body.providerName, body.providerInvoice, body.observation);
  }

  @Get(':tenantId')
  getExpenses(@Param('tenantId') tenantId: string) {
    return this.expensesService.getExpenses(tenantId);
  }

  @Delete(':id')
  deleteExpense(@Param('id') id: string) {
    return this.expensesService.deleteExpense(id);
  }
}
