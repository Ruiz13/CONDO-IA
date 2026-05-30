import { PrismaService } from '../prisma.service';
export declare class ExpensesService {
    private prisma;
    constructor(prisma: PrismaService);
    createExpense(tenantId: string, description: string, amount: number, appliesTo: string): Promise<{
        id: string;
        tenantId: string;
        amount: number;
        description: string;
        date: Date;
        isExtraordinary: boolean;
        expenseCategory: string;
        appliesTo: string;
    }>;
    getExpenses(tenantId: string): Promise<{
        id: string;
        tenantId: string;
        amount: number;
        description: string;
        date: Date;
        isExtraordinary: boolean;
        expenseCategory: string;
        appliesTo: string;
    }[]>;
}
