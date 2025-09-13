import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema/auth";

const pool = new Pool({
  connectionString: process.env.NEXT_PUBLIC_DATABASE_URL,
});

export const db = drizzle(pool, { schema });
