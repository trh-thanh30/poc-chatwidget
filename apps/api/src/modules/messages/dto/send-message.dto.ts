import { Transform } from 'class-transformer';
import { IsString, IsUUID, Matches, MaxLength } from 'class-validator';

import { MESSAGE_MAX_LENGTH } from '../message.constants';

export class SendMessageDto {
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @Matches(/\S/u)
  @MaxLength(MESSAGE_MAX_LENGTH)
  content!: string;

  @IsUUID('4')
  idempotencyKey!: string;
}
