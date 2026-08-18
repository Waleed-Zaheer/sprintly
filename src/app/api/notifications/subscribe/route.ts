import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { pushSubscriptions } from "@/lib/db/schema";
import { requireUser } from "@/lib/auth/require";

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { endpoint, keys } = body as { endpoint: string; keys: { p256dh: string; auth: string } };

  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return NextResponse.json({ error: "Malformed push subscription." }, { status: 400 });
  }

  const existing = await db.query.pushSubscriptions.findFirst({
    where: and(eq(pushSubscriptions.userId, user.id), eq(pushSubscriptions.endpoint, endpoint)),
  });

  if (!existing) {
    await db.insert(pushSubscriptions).values({
      id: crypto.randomUUID(),
      userId: user.id,
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
    });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { endpoint } = (await request.json()) as { endpoint: string };
  await db
    .delete(pushSubscriptions)
    .where(and(eq(pushSubscriptions.userId, user.id), eq(pushSubscriptions.endpoint, endpoint)));

  return NextResponse.json({ ok: true });
}
