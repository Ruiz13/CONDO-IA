import { PrismaService } from '../prisma.service';
export declare class CommunicationsService {
    private prisma;
    constructor(prisma: PrismaService);
    createAnnouncement(tenantId: string, title: string, content: string, imageUrl?: string): Promise<{
        id: string;
        createdAt: Date;
        tenantId: string;
        title: string;
        content: string;
        imageUrl: string | null;
    }>;
    getAnnouncements(tenantId: string): Promise<{
        id: string;
        createdAt: Date;
        tenantId: string;
        title: string;
        content: string;
        imageUrl: string | null;
    }[]>;
    deleteAnnouncement(id: string): Promise<{
        id: string;
        createdAt: Date;
        tenantId: string;
        title: string;
        content: string;
        imageUrl: string | null;
    }>;
    createPoll(tenantId: string, question: string, options: string[]): Promise<{
        id: string;
        createdAt: Date;
        tenantId: string;
        question: string;
        expiresAt: Date | null;
    }>;
    getPolls(tenantId: string): Promise<({
        options: ({
            _count: {
                votes: number;
            };
        } & {
            id: string;
            text: string;
            pollId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        tenantId: string;
        question: string;
        expiresAt: Date | null;
    })[]>;
    vote(pollId: string, optionId: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        pollId: string;
        optionId: string;
    }>;
}
