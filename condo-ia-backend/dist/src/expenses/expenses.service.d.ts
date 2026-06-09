import { PrismaService } from '../prisma.service';
export declare class ExpensesService {
    private prisma;
    constructor(prisma: PrismaService);
    createExpense(tenantId: string, description: string, amount: number, appliesTo: string, providerName?: string, providerInvoice?: string, observation?: string): Promise<{
        id: string;
        tenantId: string;
        amount: number;
        date: Date;
        description: string;
        isExtraordinary: boolean;
        expenseCategory: string;
        appliesTo: string;
        isBilled: boolean;
        providerName: string | null;
        providerInvoice: string | null;
    }>;
    getExpenses(tenantId: string): Promise<{
        id: string;
        tenantId: string;
        amount: number;
        date: Date;
        description: string;
        isExtraordinary: boolean;
        expenseCategory: string;
        appliesTo: string;
        isBilled: boolean;
        providerName: string | null;
        providerInvoice: string | null;
    }[]>;
    deleteExpense(id: string): Promise<{
        id: string;
        tenantId: string;
        amount: number;
        date: Date;
        description: string;
        isExtraordinary: boolean;
        expenseCategory: string;
        appliesTo: string;
        isBilled: boolean;
        providerName: string | null;
        providerInvoice: string | null;
    }>;
}
