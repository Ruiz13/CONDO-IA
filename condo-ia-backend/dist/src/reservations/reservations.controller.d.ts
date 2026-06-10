import { ReservationsService } from './reservations.service';
export declare class ReservationsController {
    private readonly reservationsService;
    constructor(reservationsService: ReservationsService);
    createReservation(body: {
        area: string;
        date: string;
        tenantId: string;
        role: string;
        userId?: string;
        unitId?: string;
    }): Promise<{
        unit: {
            id: string;
            tenantId: string;
            unitNumber: string;
            aliquotPercentage: number;
            isCommercial: boolean;
            ownerId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        tenantId: string;
        unitId: string;
        status: string;
        date: Date;
        area: string;
    }>;
    getReservations(role: string, tenantId: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        tenantId: string;
        unitId: string;
        status: string;
        date: Date;
        area: string;
    }[]>;
    updateStatus(body: {
        role: string;
        tenantId: string;
    }, id: string, status: string): Promise<{
        id: string;
        createdAt: Date;
        tenantId: string;
        unitId: string;
        status: string;
        date: Date;
        area: string;
    }>;
}
