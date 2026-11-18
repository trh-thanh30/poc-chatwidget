import { resolve } from 'node:path';

import { ConfigModule } from '@nestjs/config';

import { validateEnvironment } from './env.schema';

export const applicationConfigModule = ConfigModule.forRoot({
  cache: true,
  envFilePath: [resolve(process.cwd(), '../../.env'), resolve(process.cwd(), '.env')],
  isGlobal: true,
  validate: validateEnvironment,
});
