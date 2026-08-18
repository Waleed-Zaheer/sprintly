import { NextResponse } from "next/server";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { timeEntries } from "@/lib/db/schema";
import { requireUser } from "@/lib/auth/require";

export async function POST() {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const active = await db.query.timeEntries.findFirst({
    where: and(eq(timeEntries.userId, user.id), isNull(timeEntries.endedAt)),
  });

  if (!active) {
    return NextResponse.json({ error: "No timer is currently running." }, { status: 404 });
  }

  const endedAt = new Date();
  const durationSeconds = Math.max(0, Math.round((endedAt.getTime() - new Date(active.startedAt).getTime()) / 1000));

  await db
    .update(timeEntries)
    .set({ endedAt: endedAt.toISOString(), durationSeconds })
    .where(eq(timeEntries.id, active.id));

  return NextResponse.json({ entry: { ...active, endedAt: endedAt.toISOString(), durationSeconds } });
}
