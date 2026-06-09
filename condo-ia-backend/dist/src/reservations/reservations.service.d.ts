import { PrismaService } from '../prisma.service';
export declare class ReservationsService {
    private prisma;
    constructor(prisma: PrismaService);
    getUnitsByOwner(tenantId: string, ownerId: string): Promise<{
        id: string;
        tenantId: string;
        ownerId: string;
        unitNumber: string;
        aliquotPercentage: number;
        isCommercial: boolean;
    }[]>;
    checkDebt(tenantId: string, unitId: string): Promise<boolean>;
    createReservation(tenantId: string, unitId: string, area: string, date: Date): Promise<{
        unit: {
            id: string;
            tenantId: string;
            ownerId: string;
            unitNumber: string;
            aliquotPercentage: number;
            isCommercial: boolean;
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
    getAllReservations(tenantId: string): Promise<({
        unit: {
            owner: {
                email: string;
            };
        } & {
            id: string;
            tenantId: string;
            ownerId: string;
            unitNumber: string;
            aliquotPercentage: number;
            isCommercial: boolean;
        };
    } & {
        id: string;
        createdAt: Date;
        tenantId: string;
        unitId: string;
        status: string;
        date: Date;
        area: string;
    })[]>;
    getReservationsByUnit(tenantId: string, unitId: string): Promise<{
        id: string;
        createdAt: Date;
        tenantId: string;
        unitId: string;
        status: string;
        date: Date;
        area: string;
    }[]>;
    updateStatus(tenantId: string, reservationId: string, status: string): Promise<{
        id: string;
        createdAt: Date;
        tenantId: string;
        unitId: string;
        status: string;
        date: Date;
        area: string;
    }>;
}
