import { NextResponse } from "next/server";
import { and, eq, lt } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { subscriptions } from "@/lib/db/schema";
import { isAuthorizedCronRequest } from "@/lib/cron-auth";
import { sendPushToUser } from "@/lib/push";

export async function GET(request: Request) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date().toISOString();
  const expired = await db.query.subscriptions.findMany({
    where: and(eq(subscriptions.status, "trialing"), lt(subscriptions.trialEndsAt, now)),
  });

  for (const sub of expired) {
    await db.update(subscriptions).set({ status: "expired" }).where(eq(subscriptions.id, sub.id));
    if (sub.userId) {
      await sendPushToUser(sub.userId, {
        title: "Your Sprintly trial has ended",
        body: "Upgrade your plan to keep tracking sprints and time without interruption.",
        url: "/dashboard/settings/billing",
      }).catch(() => {});
    }
  }

  return NextResponse.json({ expired: expired.length });
}
