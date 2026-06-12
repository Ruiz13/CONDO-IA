import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { ReconciliationController } from './reconciliation.controller';
import { PaymentsService } from './payments.service';
import { PrismaModule } from '../prisma.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [PrismaModule, EmailModule],
  controllers: [PaymentsController, ReconciliationController],
  providers: [PaymentsService],
})
export class PaymentsModule {}
