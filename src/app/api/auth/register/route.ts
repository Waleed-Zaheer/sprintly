import { NextResponse } from "next/server";
import { addDays } from "date-fns";
import { db } from "@/lib/db/client";
import { companies, subscriptions, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "@/lib/auth/password";
import { createSessionCookie } from "@/lib/auth/session";
import { registerSchema } from "@/lib/validation";
import { PLAN_DEFINITIONS } from "@/lib/plans";
import { isValidPhone, formatPhoneE164 } from "@/lib/phone";
import { getClientIp, lookupGeo } from "@/lib/geo";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { name, email, password, phone, plan, companyName } = parsed.data;

  const existing = await db.query.users.findFirst({ where: eq(users.email, email.toLowerCase()) });
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  }

  if (phone && !isValidPhone(phone)) {
    return NextResponse.json({ error: "That phone number doesn't look valid." }, { status: 400 });
  }

  const planDef = PLAN_DEFINITIONS[plan];
  const passwordHash = await hashPassword(password);
  const userId = crypto.randomUUID();

  let companyId: string | null = null;
  let role: "owner" | "admin" | "member" = "member";

  if (plan === "enterprise") {
    if (!companyName) {
      return NextResponse.json({ error: "Company name is required for the Enterprise plan." }, { status: 400 });
    }
    companyId = crypto.randomUUID();
    role = "owner";
    await db.insert(companies).values({
      id: companyId,
      name: companyName,
      ownerId: userId,
      plan: "enterprise",
      seatLimit: planDef.seatLimit,
    });
  }

  const signupIp = getClientIp(request);
  const geo = signupIp ? await lookupGeo(signupIp) : { country: null, region: null, city: null };

  await db.insert(users).values({
    id: userId,
    name,
    email: email.toLowerCase(),
    phone: phone ? formatPhoneE164(phone) : null,
    passwordHash,
    companyId,
    role,
    signupIp,
    signupCountry: geo.country,
    signupRegion: geo.region,
    signupCity: geo.city,
  });

  const trialEndsAt = planDef.trialDays > 0 ? addDays(new Date(), planDef.trialDays).toISOString() : null;

  await db.insert(subscriptions).values({
    id: crypto.randomUUID(),
    userId: plan === "enterprise" ? null : userId,
    companyId,
    plan,
    status: plan === "enterprise" ? "past_due" : "trialing",
    trialEndsAt,
  });

  await createSessionCookie({ sub: userId, email: email.toLowerCase(), companyId, role });

  return NextResponse.json({
    user: { id: userId, name, email, role, companyId },
    requiresCheckout: plan === "enterprise",
  });
}
