import { NextResponse } from "next/server";
import { startOfWeek } from "date-fns";
import { and, desc, eq, isNotNull, isNull, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { timeEntries } from "@/lib/db/schema";
import { requireUser } from "@/lib/auth/require";

export async function GET() {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await db.query.timeEntries.findMany({
    where: eq(timeEntries.userId, user.id),
    orderBy: desc(timeEntries.startedAt),
    limit: 50,
  });

  const active = rows.find((r) => !r.endedAt) ?? null;

  // Totals only count completed entries (durationSeconds is set once a
  // timer stops) — the currently-running entry's live elapsed time is
  // already shown separately by the timer widget itself.
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }).toISOString();
  const [totals] = await db
    .select({
      totalSeconds: sql<number>`coalesce(sum(${timeEntries.durationSeconds}), 0)`,
      weekSeconds: sql<number>`coalesce(sum(case when ${timeEntries.startedAt} >= ${weekStart} then ${timeEntries.durationSeconds} else 0 end), 0)`,
    })
    .from(timeEntries)
    .where(and(eq(timeEntries.userId, user.id), isNotNull(timeEntries.durationSeconds)));

  return NextResponse.json({
    entries: rows,
    active,
    summary: { totalSeconds: totals?.totalSeconds ?? 0, weekSeconds: totals?.weekSeconds ?? 0 },
  });
}

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const { taskId, sprintId, note } = body as { taskId?: string; sprintId?: string; note?: string };

  const existingActive = await db.query.timeEntries.findFirst({
    where: and(eq(timeEntries.userId, user.id), isNull(timeEntries.endedAt)),
  });
  if (existingActive) {
    return NextResponse.json({ error: "A timer is already running. Stop it before starting a new one." }, { status: 409 });
  }

  const entry = {
    id: crypto.randomUUID(),
    userId: user.id,
    taskId: taskId ?? null,
    sprintId: sprintId ?? null,
    note: note ?? null,
    startedAt: new Date().toISOString(),
  };

  await db.insert(timeEntries).values(entry);
  return NextResponse.json({ entry }, { status: 201 });
}
