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
import { ExpensesModule } from './expenses/expenses.module';
import { TenantsModule } from './tenants/tenants.module';
import { EmailModule } from './email/email.module';
import { KnowledgeModule } from './knowledge/knowledge.module';
import { BillingModule } from './billing/billing.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ReservationsModule } from './reservations/reservations.module';
import { WhatsappModule } from './whatsapp/whatsapp.module';

@Module({
  imports: [ScheduleModule.forRoot(), PrismaModule, EmailModule, KnowledgeModule, ChatModule, InvoicesModule, AuthModule, PaymentsModule, AuditModule, CommunicationsModule, ExpensesModule, TenantsModule, BillingModule, ReservationsModule, WhatsappModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
