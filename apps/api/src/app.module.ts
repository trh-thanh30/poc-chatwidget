import { Module } from '@nestjs/common';

import { CommonModule } from './common/common.module';
import { applicationConfigModule } from './config/configuration';
import { HealthModule } from './modules/health/health.module';
import { MessagesModule } from './modules/messages/messages.module';
import { WidgetSessionsModule } from './modules/widget-sessions/widget-sessions.module';

@Module({
  imports: [
    applicationConfigModule,
    CommonModule,
    HealthModule,
    WidgetSessionsModule,
    MessagesModule,
  ],
})
export class AppModule {}
