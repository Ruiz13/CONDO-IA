import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CommunicationsService {
  constructor(private prisma: PrismaService) {}

  async createAnnouncement(tenantId: string, title: string, content: string) {
    return this.prisma.announcement.create({
      data: { tenantId, title, content }
    });
  }

  async getAnnouncements(tenantId: string) {
    return this.prisma.announcement.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async createPoll(tenantId: string, question: string, options: string[]) {
    return this.prisma.poll.create({
      data: {
        tenantId,
        question,
        options: {
          create: options.map(opt => ({ text: opt }))
        }
      }
    });
  }

  async getPolls(tenantId: string) {
    return this.prisma.poll.findMany({
      where: { tenantId },
      include: {
        options: {
          include: { _count: { select: { votes: true } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async vote(pollId: string, optionId: string, userId: string) {
    // Esto fallará automáticamente si el usuario ya votó debido al @@unique en Prisma
    return this.prisma.vote.create({
      data: { pollId, optionId, userId }
    });
  }
}
