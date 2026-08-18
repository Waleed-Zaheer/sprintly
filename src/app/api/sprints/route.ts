import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { sprints } from "@/lib/db/schema";
import { requireUser } from "@/lib/auth/require";
import { sprintSchema } from "@/lib/validation";

export async function GET() {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const scope = user.companyId ? eq(sprints.companyId, user.companyId) : eq(sprints.ownerId, user.id);
  const rows = await db.query.sprints.findMany({ where: scope, orderBy: (t, { desc }) => desc(t.startDate) });
  return NextResponse.json({ sprints: rows });
}

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = sprintSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const sprint = {
    id: crypto.randomUUID(),
    ownerId: user.id,
    companyId: user.companyId,
    status: "planned" as const,
    ...parsed.data,
  };

  await db.insert(sprints).values(sprint);
  return NextResponse.json({ sprint }, { status: 201 });
}
