import { Body, Controller, Get, Headers, Inject, Post, Req, UseGuards } from '@nestjs/common';

// Kept as a value import so Nest can emit runtime DTO metadata for ValidationPipe.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { CreateWidgetSessionDto } from './dto/create-widget-session.dto';
import { CreateWidgetSessionUseCase } from './use-cases/create-widget-session.use-case';
import { WidgetSessionGuard, type WidgetSessionRequest } from './widget-session.guard';

@Controller('widget-sessions')
export class WidgetSessionsController {
  constructor(
    @Inject(CreateWidgetSessionUseCase)
    private readonly createWidgetSession: CreateWidgetSessionUseCase,
  ) {}

  @Post()
  create(@Body() input: CreateWidgetSessionDto, @Headers('origin') origin: string | undefined) {
    return this.createWidgetSession.execute({ widgetId: input.widgetId, origin });
  }

  @Get('current')
  @UseGuards(WidgetSessionGuard)
  current(@Req() request: WidgetSessionRequest) {
    const session = request.widgetSession!;
    return {
      data: {
        sessionId: session.id,
        widgetId: session.widgetId,
        origin: session.origin,
        expiresAt: session.expiresAt.toISOString(),
      },
    };
  }
}
