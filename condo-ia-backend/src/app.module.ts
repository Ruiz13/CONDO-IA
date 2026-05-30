import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatModule } from './chat/chat.module';
import { PrismaModule } from './prisma.module';
import { InvoicesModule } from './invoices/invoices.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [PrismaModule, ChatModule, InvoicesModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
