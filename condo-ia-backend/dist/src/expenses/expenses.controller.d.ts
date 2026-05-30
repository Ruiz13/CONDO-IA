import { ExpensesService } from './expenses.service';
export declare class ExpensesController {
    private readonly expensesService;
    constructor(expensesService: ExpensesService);
    createExpense(body: {
        tenantId: string;
        description: string;
        amount: number;
        appliesTo: string;
    }): Promise<{
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
