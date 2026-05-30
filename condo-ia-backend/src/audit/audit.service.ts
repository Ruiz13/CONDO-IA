import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async getAuditLogs() {
    return this.prisma.auditLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: 50, // Limit to recent 50 logs for performance
      include: {
        user: {
          select: { email: true, role: true }
        }
      }
    });
  }
}
