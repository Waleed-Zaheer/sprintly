import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

let url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  // `NODE_ENV` is "production" for every `next build`/`next start`, including
  // a local build with no Turso account yet — it isn't a signal that this is
  // an actual deployment. `VERCEL_ENV` only exists on Vercel and is the
  // right thing to gate on: refuse to silently ship a real production
  // deploy without a configured database, but let local builds and Vercel
  // preview deploys fall back to a throwaway file db.
  if (process.env.VERCEL_ENV === "production") {
    throw new Error("TURSO_DATABASE_URL is not set. Configure it in the Vercel project's environment variables.");
  }
  // Local dev fallback: a file-backed SQLite db so `npm run dev`/`build` work without a Turso account.
  // Point TURSO_DATABASE_URL at a real Turso db (or `turso dev`) once you're ready to test sync.
  url = "file:./sprintly-dev.db";
  console.warn("[db] TURSO_DATABASE_URL not set — using local file db at ./sprintly-dev.db for development.");
}

const client = createClient({ url, authToken });

export const db = drizzle(client, { schema });
