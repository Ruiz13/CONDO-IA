export interface PdfInvoiceData {
    tenantName: string;
    logoBase64?: string | null;
    rif?: string | null;
    address?: string | null;
    phone?: string | null;
    invoiceNumber: string;
    unitNumber: string;
    aliquotPercentage: number;
    totalDebt: number;
    month: number;
    year: number;
    expensesDetails: any[];
    isPaid: boolean;
}
export declare class PdfService {
    generateInvoicePdf(data: PdfInvoiceData): Promise<Buffer>;
}
