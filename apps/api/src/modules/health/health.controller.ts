import { Controller, Get } from '@nestjs/common';

export type HealthResponse = {
  service: 'chat-widget-api';
  status: 'ok';
};

@Controller()
export class HealthController {
  @Get('health')
  health(): HealthResponse {
    return {
      service: 'chat-widget-api',
      status: 'ok',
    };
  }
}
