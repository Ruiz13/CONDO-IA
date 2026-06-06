import { BillingService } from './billing.service';
export declare class BillingController {
    private readonly billingService;
    constructor(billingService: BillingService);
    generateBilling(tenantId: string): Promise<{
        message: string;
    }>;
}
