import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { tasks } from "@/lib/db/schema";
import { requireUser } from "@/lib/auth/require";
import { taskSchema } from "@/lib/validation";

export async function GET(request: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sprintId = new URL(request.url).searchParams.get("sprintId");
  if (!sprintId) return NextResponse.json({ error: "sprintId is required" }, { status: 400 });

  const rows = await db.query.tasks.findMany({ where: eq(tasks.sprintId, sprintId) });
  return NextResponse.json({ tasks: rows });
}

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = taskSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const task = { id: crypto.randomUUID(), status: "todo" as const, ...parsed.data };
  await db.insert(tasks).values(task);
  return NextResponse.json({ task }, { status: 201 });
}
