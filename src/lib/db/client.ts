import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

let url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("TURSO_DATABASE_URL is not set. Copy .env.example to .env.local and fill it in.");
  }
  // Local dev fallback: a file-backed SQLite db so `npm run dev` works without a Turso account.
  // Point TURSO_DATABASE_URL at a real Turso db (or `turso dev`) once you're ready to test sync.
  url = "file:./sprintly-dev.db";
  console.warn("[db] TURSO_DATABASE_URL not set — using local file db at ./sprintly-dev.db for development.");
}

const client = createClient({ url, authToken });

export const db = drizzle(client, { schema });
