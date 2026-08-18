import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getStripe } from "@/lib/stripe";
import { requireUser } from "@/lib/auth/require";
import { db } from "@/lib/db/client";
import { companies } from "@/lib/db/schema";

export async function POST() {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const company = user.companyId
    ? await db.query.companies.findFirst({ where: eq(companies.id, user.companyId) })
    : null;

  const customerId = company?.stripeCustomerId;
  if (!customerId) {
    return NextResponse.json({ error: "No billing account on file yet." }, { status: 404 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const stripe = getStripe();
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${appUrl}/dashboard/settings/billing`,
  });

  return NextResponse.json({ url: portalSession.url });
}
