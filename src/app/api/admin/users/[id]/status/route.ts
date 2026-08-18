import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { requirePlatformAdmin } from "@/lib/auth/admin";
import { accountStatusUpdateSchema } from "@/lib/validation";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requirePlatformAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { id } = await params;
  if (id === admin.id) {
    return NextResponse.json({ error: "You can't change your own account status." }, { status: 400 });
  }

  const target = await db.query.users.findFirst({ where: eq(users.id, id) });
  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const body = await request.json();
  const parsed = accountStatusUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  await db.update(users).set({ accountStatus: parsed.data.status }).where(eq(users.id, id));
  return NextResponse.json({ user: { ...target, accountStatus: parsed.data.status } });
}
