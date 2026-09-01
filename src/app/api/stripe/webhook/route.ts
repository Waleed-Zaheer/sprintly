import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { db } from "@/lib/db/client";
import { companies, subscriptions, users, processedStripeEvents } from "@/lib/db/schema";
import type { Plan } from "@/lib/db/schema";
import { sendEmail, paymentFailedEmail, trialEndingEmail } from "@/lib/email";
import { SITE_URL } from "@/lib/site";

// A subscription is billed either to a company (via its owner) or directly
// to an individual user — look up whichever email applies so dunning/trial
// emails can be sent without blocking the webhook response on failure.
async function emailForSubscription(sub: { companyId: string | null; userId: string | null }) {
  try {
    if (sub.companyId) {
      const [company] = await db.select().from(companies).where(eq(companies.id, sub.companyId)).limit(1);
      if (!company) return null;
      const [owner] = await db.select().from(users).where(eq(users.id, company.ownerId)).limit(1);
      return owner?.email ?? null;
    }
    if (sub.userId) {
      const [user] = await db.select().from(users).where(eq(users.id, sub.userId)).limit(1);
      return user?.email ?? null;
    }
  } catch {
    return null;
  }
  return null;
}

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

  // Stripe guarantees at-least-once delivery and can redeliver an event
  // we already handled successfully. Claim the event id first — if
  // another delivery already claimed it, no-op instead of re-running the
  // state change below.
  try {
    await db.insert(processedStripeEvents).values({ eventId: event.id, type: event.type });
  } catch {
    return NextResponse.json({ received: true, duplicate: true });
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

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId =
        typeof invoice.parent?.subscription_details?.subscription === "string"
          ? invoice.parent.subscription_details.subscription
          : null;
      if (!subscriptionId) break;

      const [record] = await db
        .update(subscriptions)
        .set({ status: "past_due" })
        .where(eq(subscriptions.stripeSubscriptionId, subscriptionId))
        .returning();
      if (!record) break;

      const email = await emailForSubscription(record);
      if (email) {
        await sendEmail({
          to: email,
          subject: "We couldn't process your Sprintly payment",
          html: paymentFailedEmail(`${SITE_URL}/dashboard/settings/billing`),
        }).catch(() => {});
      }
      break;
    }

    case "customer.subscription.trial_will_end": {
      const sub = event.data.object as Stripe.Subscription;
      const [record] = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.stripeSubscriptionId, sub.id))
        .limit(1);
      if (!record) break;

      const email = await emailForSubscription(record);
      if (email) {
        await sendEmail({
          to: email,
          subject: "Your Sprintly trial is ending soon",
          html: trialEndingEmail(`${SITE_URL}/dashboard/settings/billing`),
        }).catch(() => {});
      }
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
