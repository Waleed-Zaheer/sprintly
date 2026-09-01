import { sql } from "drizzle-orm";
import { after } from "next/server";
import { db } from "@/lib/db/client";
import { rateLimitHits } from "@/lib/db/schema";

/**
 * Fixed-window rate limiter backed by the app's own SQLite/Turso database —
 * no Redis/Upstash account needed. Each (key, window) pair gets one row;
 * a request increments it atomically via ON CONFLICT DO UPDATE, and the
 * caller is rejected once the window's count exceeds `limit`.
 */
export async function checkRateLimit({
  key,
  limit,
  windowMs,
}: {
  key: string;
  limit: number;
  windowMs: number;
}): Promise<{ allowed: boolean; remaining: number }> {
  const windowStart = Math.floor(Date.now() / windowMs) * windowMs;

  const [row] = await db
    .insert(rateLimitHits)
    .values({ key, windowStart, count: 1 })
    .onConflictDoUpdate({
      target: [rateLimitHits.key, rateLimitHits.windowStart],
      set: { count: sql`${rateLimitHits.count} + 1` },
    })
    .returning({ count: rateLimitHits.count });

  // Opportunistically sweep old windows so this table doesn't grow forever.
  // Cheap and safe to skip most of the time — there's no correctness
  // requirement that it runs on every request.
  if (Math.random() < 0.01) {
    after(() =>
      db
        .delete(rateLimitHits)
        .where(sql`${rateLimitHits.windowStart} < ${Date.now() - 24 * 60 * 60 * 1000}`)
        .catch(() => {}),
    );
  }

  const count = row?.count ?? 1;
  return { allowed: count <= limit, remaining: Math.max(0, limit - count) };
}

export function rateLimitResponse() {
  return Response.json(
    { error: "Too many attempts. Please wait a few minutes and try again." },
    { status: 429 },
  );
}
