import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) {}

  async createExpense(tenantId: string, description: string, amount: number, appliesTo: string, providerName?: string, providerInvoice?: string) {
    return this.prisma.expense.create({
      data: {
        tenantId,
        description,
        amount,
        appliesTo,
        providerName,
        providerInvoice
      }
    });
  }

  async getExpenses(tenantId: string) {
    return this.prisma.expense.findMany({
      where: { tenantId },
      orderBy: { date: 'desc' }
    });
  }

  async deleteExpense(id: string) {
    return this.prisma.expense.delete({
      where: { id }
    });
  }
}
