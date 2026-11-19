import { z } from 'zod';

const cookieJsonSchema = z.string().min(2).refine(
  (value) => {
    try {
      return Array.isArray(JSON.parse(value));
    } catch {
      return false;
    }
  },
  { message: 'Expected a JSON cookie array.' },
);

export const environmentSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().min(1).max(65_535).default(3000),
    DATABASE_URL: z.url(),
    WIDGET_SESSION_JWT_SECRET: z.string().min(32),
    WIDGET_SESSION_JWT_TTL_SECONDS: z.coerce.number().int().positive().default(900),
    CHAT_CHANNEL: z.enum(['mock', 'zalo-personal']).default('mock'),
    ZALO_PERSONAL_COOKIE_JSON: cookieJsonSchema.optional(),
    ZALO_PERSONAL_IMEI: z.string().trim().min(1).optional(),
    ZALO_PERSONAL_USER_AGENT: z.string().trim().min(1).optional(),
    ZALO_PERSONAL_OPERATOR_THREAD_ID: z.string().trim().min(1).optional(),
    ZALO_PERSONAL_OPERATOR_THREAD_TYPE: z.enum(['user', 'group']).default('user'),
  })
  .superRefine((environment, context) => {
    if (environment.CHAT_CHANNEL !== 'zalo-personal') return;

    for (const key of [
      'ZALO_PERSONAL_COOKIE_JSON',
      'ZALO_PERSONAL_IMEI',
      'ZALO_PERSONAL_USER_AGENT',
      'ZALO_PERSONAL_OPERATOR_THREAD_ID',
    ] as const) {
      if (!environment[key]) {
        context.addIssue({
          code: 'custom',
          message: `${key} is required when CHAT_CHANNEL=zalo-personal.`,
          path: [key],
        });
      }
    }
  });

export type Environment = z.infer<typeof environmentSchema>;

export function validateEnvironment(input: Record<string, unknown>): Environment {
  return environmentSchema.parse(input);
}
