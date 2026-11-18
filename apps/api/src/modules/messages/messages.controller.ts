import { Body, Controller, Get, Inject, Post, Req, UseGuards } from '@nestjs/common';

// Kept as a value import so Nest can emit runtime DTO metadata for ValidationPipe.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { SendMessageDto } from './dto/send-message.dto';
import { MessageRateLimitGuard } from './policies/message-rate-limit.guard';
import { ListMessagesUseCase } from './use-cases/list-messages.use-case';
import { SendMessageUseCase } from './use-cases/send-message.use-case';
import {
  WidgetSessionGuard,
  type WidgetSessionRequest,
} from '../widget-sessions/widget-session.guard';

@Controller('messages')
@UseGuards(WidgetSessionGuard)
export class MessagesController {
  constructor(
    @Inject(SendMessageUseCase) private readonly sendMessage: SendMessageUseCase,
    @Inject(ListMessagesUseCase) private readonly listMessages: ListMessagesUseCase,
  ) {}

  @Post()
  @UseGuards(MessageRateLimitGuard)
  send(@Body() input: SendMessageDto, @Req() request: WidgetSessionRequest) {
    return this.sendMessage.execute({
      session: request.widgetSession!,
      content: input.content,
      idempotencyKey: input.idempotencyKey,
    });
  }

  @Get()
  list(@Req() request: WidgetSessionRequest) {
    return this.listMessages.execute(request.widgetSession!);
  }
}
