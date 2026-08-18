import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { invitations, users } from "@/lib/db/schema";
import { hashPassword } from "@/lib/auth/password";
import { createSessionCookie } from "@/lib/auth/session";
import { acceptInviteSchema } from "@/lib/validation";
import { getClientIp, lookupGeo } from "@/lib/geo";

export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const invitation = await db.query.invitations.findFirst({ where: eq(invitations.token, token) });

  if (!invitation || invitation.status !== "pending" || new Date(invitation.expiresAt) < new Date()) {
    return NextResponse.json({ error: "This invite is invalid or has expired." }, { status: 404 });
  }

  const body = await request.json();
  const parsed = acceptInviteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter your name and a password with at least 8 characters." }, { status: 400 });
  }

  const existing = await db.query.users.findFirst({ where: eq(users.email, invitation.email) });
  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists. Log in and ask your team admin to add you." },
      { status: 409 },
    );
  }

  const { name, password } = parsed.data;
  const passwordHash = await hashPassword(password);
  const userId = crypto.randomUUID();

  const signupIp = getClientIp(request);
  const geo = signupIp ? await lookupGeo(signupIp) : { country: null, region: null, city: null };

  await db.insert(users).values({
    id: userId,
    name,
    email: invitation.email,
    passwordHash,
    companyId: invitation.companyId,
    role: "member",
    signupIp,
    signupCountry: geo.country,
    signupRegion: geo.region,
    signupCity: geo.city,
  });

  // No per-user subscription row here — billing/subscription status is
  // scoped to the company (already created when the owner registered) and
  // looked up by companyId, same as every other member.

  await db.update(invitations).set({ status: "accepted" }).where(eq(invitations.id, invitation.id));

  await createSessionCookie({ sub: userId, email: invitation.email, companyId: invitation.companyId, role: "member" });

  return NextResponse.json({ ok: true });
}
