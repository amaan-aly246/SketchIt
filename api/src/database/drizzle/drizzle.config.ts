
import { defineConfig } from 'drizzle-kit';
import config from '../../config';

export default defineConfig({
  schema: "./src/database/schema/tables.ts",
  out: "./src/database/drizzle/migrations",
  dialect: 'postgresql',
  dbCredentials: {
    url: config.env.db_url!,
  },
});
