import { ValidationPipe } from '@nestjs/common';

import { BadRequestError } from '../errors/bad-request.error';

export function createValidationPipe(): ValidationPipe {
  return new ValidationPipe({
    forbidNonWhitelisted: true,
    transform: true,
    whitelist: true,
    exceptionFactory: () => new BadRequestError('VALIDATION_ERROR', 'Request validation failed.'),
  });
}
