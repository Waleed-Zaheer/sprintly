import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { sprints, tasks } from "@/lib/db/schema";
import { requireUser } from "@/lib/auth/require";
import { sprintStatusSchema } from "@/lib/validation";

async function loadAuthorizedSprint(sprintId: string, user: { id: string; companyId: string | null }) {
  const sprint = await db.query.sprints.findFirst({ where: eq(sprints.id, sprintId) });
  if (!sprint) return null;
  const authorized = user.companyId ? sprint.companyId === user.companyId : sprint.ownerId === user.id;
  return authorized ? sprint : null;
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const sprint = await loadAuthorizedSprint(id, user);
  if (!sprint) return NextResponse.json({ error: "Sprint not found" }, { status: 404 });

  const sprintTasks = await db.query.tasks.findMany({ where: eq(tasks.sprintId, sprint.id) });
  return NextResponse.json({ sprint, tasks: sprintTasks });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const sprint = await loadAuthorizedSprint(id, user);
  if (!sprint) return NextResponse.json({ error: "Sprint not found" }, { status: 404 });

  const body = await request.json();
  const parsed = sprintStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  await db.update(sprints).set({ status: parsed.data.status }).where(eq(sprints.id, sprint.id));
  return NextResponse.json({ sprint: { ...sprint, status: parsed.data.status } });
}
