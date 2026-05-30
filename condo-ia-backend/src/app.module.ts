import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatModule } from './chat/chat.module';
import { PrismaModule } from './prisma.module';
import { InvoicesModule } from './invoices/invoices.module';
import { AuthModule } from './auth/auth.module';
import { PaymentsModule } from './payments/payments.module';
import { AuditModule } from './audit/audit.module';
import { CommunicationsModule } from './communications/communications.module';

@Module({
  imports: [PrismaModule, ChatModule, InvoicesModule, AuthModule, PaymentsModule, AuditModule, CommunicationsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
