import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { subscriptions } from "@/lib/db/schema";
import { requireUser } from "@/lib/auth/require";

export async function GET() {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const subscription = await db.query.subscriptions.findFirst({
    where: user.companyId
      ? eq(subscriptions.companyId, user.companyId)
      : eq(subscriptions.userId, user.id),
  });

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
      locale: user.locale,
    },
    subscription,
  });
}
