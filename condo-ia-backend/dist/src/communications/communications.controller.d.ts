import { CommunicationsService } from './communications.service';
export declare class CommunicationsController {
    private readonly commsService;
    constructor(commsService: CommunicationsService);
    createAnnouncement(body: {
        tenantId: string;
        title: string;
        content: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        tenantId: string;
        title: string;
        content: string;
    }>;
    getAnnouncements(tenantId: string): Promise<{
        id: string;
        createdAt: Date;
        tenantId: string;
        title: string;
        content: string;
    }[]>;
    createPoll(body: {
        tenantId: string;
        question: string;
        options: string[];
    }): Promise<{
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
    vote(pollId: string, body: {
        optionId: string;
        userId: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        pollId: string;
        optionId: string;
    }>;
}
