import { config } from 'dotenv';
import { defineConfig, env } from 'prisma/config';
import path from 'path';

// Load environment variables from .env.local first, then .env
config({ path: path.resolve(__dirname, '.env.local') });
config({ path: path.resolve(__dirname, '.env') });

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('POSTGRES_PRISMA_URL'),
  },
});
