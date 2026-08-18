import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { sprints, tasks } from "@/lib/db/schema";
import { requireUser } from "@/lib/auth/require";
import { taskStatusSchema } from "@/lib/validation";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const task = await db.query.tasks.findFirst({ where: eq(tasks.id, id) });
  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

  const sprint = await db.query.sprints.findFirst({ where: eq(sprints.id, task.sprintId) });
  const authorized = sprint && (user.companyId ? sprint.companyId === user.companyId : sprint.ownerId === user.id);
  if (!authorized) return NextResponse.json({ error: "Task not found" }, { status: 404 });

  const body = await request.json();
  const parsed = taskStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  await db.update(tasks).set({ status: parsed.data.status }).where(eq(tasks.id, task.id));
  return NextResponse.json({ task: { ...task, status: parsed.data.status } });
}
