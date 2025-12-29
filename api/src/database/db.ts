// import config from '../config';
// import { drizzle } from 'drizzle-orm/neon-http';
// import { neon } from '@neondatabase/serverless';
//
//
// const sql = neon(config.env.db_url!);
// export const db = drizzle({ client: sql });

import config from "../config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: config.env.db_url!,
  ssl: { rejectUnauthorized: false }, // keep if you're connecting to Neon
});

export const db = drizzle(pool);
