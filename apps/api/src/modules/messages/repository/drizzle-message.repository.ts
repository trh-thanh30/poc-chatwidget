import { Inject, Injectable } from '@nestjs/common';
import { and, asc, eq, isNotNull } from 'drizzle-orm';

import { DatabaseService } from '../../../database/database.service';
import { messages } from '../../../database/schema';
import type {
  ChatMessage,
  CreateVisitorMessageResult,
  NewOperatorMessage,
  NewVisitorMessage,
} from '../types/message.types';
import type { MessageRepository } from './message.repository';

@Injectable()
export class DrizzleMessageRepository implements MessageRepository {
  constructor(@Inject(DatabaseService) private readonly database: DatabaseService) {}

  async createVisitorMessage(input: NewVisitorMessage): Promise<CreateVisitorMessageResult> {
    const [created] = await this.database.db
      .insert(messages)
      .values({ ...input, direction: 'visitor', channelMessageId: null })
      .onConflictDoNothing({ target: [messages.sessionId, messages.idempotencyKey] })
      .returning();

    if (created) return { message: created, created: true };

    const [existing] = await this.database.db
      .select()
      .from(messages)
      .where(
        and(
          eq(messages.sessionId, input.sessionId),
          eq(messages.idempotencyKey, input.idempotencyKey),
        ),
      )
      .limit(1);
    if (!existing) throw new Error('Idempotent message insert did not return an existing row.');

    return { message: existing, created: false };
  }

  async createOperatorMessage(input: NewOperatorMessage): Promise<ChatMessage> {
    const [created] = await this.database.db
      .insert(messages)
      .values({ ...input, direction: 'operator', idempotencyKey: null })
      .onConflictDoNothing({ target: messages.channelMessageId })
      .returning();
    if (created) return created;

    const [existing] = await this.database.db
      .select()
      .from(messages)
      .where(eq(messages.channelMessageId, input.channelMessageId))
      .limit(1);
    if (!existing) throw new Error('Channel message insert did not return an existing row.');

    return existing;
  }

  async setVisitorChannelMessageId(messageId: string, channelMessageId: string): Promise<void> {
    await this.database.db
      .update(messages)
      .set({ channelMessageId })
      .where(and(eq(messages.id, messageId), eq(messages.direction, 'visitor')));
  }

  async listVisitorChannelMessageIds(sessionId: string): Promise<string[]> {
    const rows = await this.database.db
      .select({ channelMessageId: messages.channelMessageId })
      .from(messages)
      .where(
        and(
          eq(messages.sessionId, sessionId),
          eq(messages.direction, 'visitor'),
          isNotNull(messages.channelMessageId),
        ),
      );
    return rows.flatMap(({ channelMessageId }) =>
      channelMessageId === null ? [] : [channelMessageId],
    );
  }

  async listMessages(sessionId: string): Promise<ChatMessage[]> {
    return this.database.db
      .select()
      .from(messages)
      .where(eq(messages.sessionId, sessionId))
      .orderBy(asc(messages.createdAt), asc(messages.id));
  }
}
