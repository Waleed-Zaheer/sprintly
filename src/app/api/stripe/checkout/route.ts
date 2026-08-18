import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { requireUser } from "@/lib/auth/require";
import { PLAN_DEFINITIONS } from "@/lib/plans";
import type { Plan } from "@/lib/db/schema";

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { plan } = (await request.json()) as { plan: Plan };
  const planDef = PLAN_DEFINITIONS[plan];
  if (!planDef.stripePriceEnv) {
    return NextResponse.json({ error: "This plan doesn't require checkout." }, { status: 400 });
  }

  const priceId = process.env[planDef.stripePriceEnv];
  if (!priceId) {
    return NextResponse.json({ error: `${planDef.stripePriceEnv} is not configured.` }, { status: 500 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const stripe = getStripe();

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: user.email,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/dashboard/settings/billing?checkout=success`,
    cancel_url: `${appUrl}/dashboard/settings/billing?checkout=cancelled`,
    metadata: {
      userId: user.id,
      companyId: user.companyId ?? "",
      plan,
    },
  });

  return NextResponse.json({ url: session.url });
}
