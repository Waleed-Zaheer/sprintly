import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { db } from "@/lib/db/client";
import { companies, subscriptions } from "@/lib/db/schema";
import type { Plan } from "@/lib/db/schema";

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "STRIPE_WEBHOOK_SECRET is not set." }, { status: 500 });
  }

  const stripe = getStripe();
  const signature = request.headers.get("stripe-signature");
  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature ?? "", secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const { userId, companyId, plan } = session.metadata as { userId?: string; companyId?: string; plan?: Plan };
      if (!plan) break;

      const subscriptionId = session.subscription as string | null;
      const customerId = session.customer as string | null;

      if (companyId) {
        await db
          .update(companies)
          .set({ stripeCustomerId: customerId, stripeSubscriptionId: subscriptionId, plan })
          .where(eq(companies.id, companyId));
        await db
          .update(subscriptions)
          .set({ status: "active", stripeSubscriptionId: subscriptionId })
          .where(eq(subscriptions.companyId, companyId));
      } else if (userId) {
        await db
          .update(subscriptions)
          .set({ status: "active", stripeSubscriptionId: subscriptionId, plan })
          .where(eq(subscriptions.userId, userId));
      }
      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const status = sub.status === "active" ? "active" : sub.status === "past_due" ? "past_due" : "canceled";
      await db
        .update(subscriptions)
        .set({ status })
        .where(eq(subscriptions.stripeSubscriptionId, sub.id));
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
