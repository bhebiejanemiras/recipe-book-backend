import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { ENV } from "@/config/env";
import * as schema from "./schema";

if (!ENV.DATABASE_URL) throw new Error("DATABASE_URL is required");

// Hosted PostgreSQL providers such as Neon require SSL. Local databases
// usually do not, so only enable SSL when the host is not local.
const isLocalHost = /(^|@)(localhost|127\.0\.0\.1|::1)(:|\/)/.test(ENV.DATABASE_URL);

export const pool = new Pool({
  connectionString: ENV.DATABASE_URL,
  ssl: isLocalHost ? undefined : { rejectUnauthorized: false },
});

export const db = drizzle({ client: pool, schema });
