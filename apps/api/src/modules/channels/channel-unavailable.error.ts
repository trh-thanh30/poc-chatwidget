import { HttpStatus } from '@nestjs/common';

import { ApiError } from '../../common/errors/api-error';

export class ChannelUnavailableError extends ApiError {
  constructor() {
    super(
      HttpStatus.SERVICE_UNAVAILABLE,
      'CHANNEL_UNAVAILABLE',
      'The chat channel is temporarily unavailable.',
    );
  }
}
