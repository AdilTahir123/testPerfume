import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

// Local: a file called local.db next to the project (no account needed).
// Live site: set DATABASE_URL (libsql://...) and DATABASE_AUTH_TOKEN (Turso).
const client = createClient({
  url: process.env.DATABASE_URL ?? "file:local.db",
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });
