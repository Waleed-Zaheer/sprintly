import { NextResponse } from "next/server";
import { addHours } from "date-fns";
import { and, eq, gt, lt } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { sprints, users } from "@/lib/db/schema";
import { isAuthorizedCronRequest } from "@/lib/cron-auth";
import { sendPushToUser } from "@/lib/push";

export async function GET(request: Request) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const soon = addHours(now, 24);

  const endingSoon = await db.query.sprints.findMany({
    where: and(eq(sprints.status, "active"), gt(sprints.endDate, now.toISOString()), lt(sprints.endDate, soon.toISOString())),
  });

  let notified = 0;
  for (const sprint of endingSoon) {
    const recipients = sprint.companyId
      ? await db.query.users.findMany({ where: eq(users.companyId, sprint.companyId) })
      : [{ id: sprint.ownerId }];

    for (const recipient of recipients) {
      await sendPushToUser(recipient.id, {
        title: `"${sprint.name}" ends soon`,
        body: "This sprint wraps up within 24 hours — wrap up open tasks now.",
        url: "/dashboard/sprints",
      }).catch(() => {});
      notified += 1;
    }
  }

  return NextResponse.json({ sprintsEndingSoon: endingSoon.length, notified });
}
