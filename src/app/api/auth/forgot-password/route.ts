import { NextResponse } from "next/server";
import { addHours } from "date-fns";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { forgotPasswordSchema } from "@/lib/validation";
import { sendEmail, passwordResetEmail } from "@/lib/email";
import { getClientIp } from "@/lib/geo";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

// Always returns the same generic response, whether or not the email is
// registered — otherwise this endpoint becomes a way to enumerate accounts.
const GENERIC_RESPONSE = { message: "If that email is registered, we've sent a password reset link." };

export async function POST(request: Request) {
  const ip = getClientIp(request) ?? "unknown";
  // Also throttled per-email below the IP check, since this endpoint is an
  // email-sending relay: a single IP shouldn't be able to spam one inbox
  // through repeated small requests, or fan out across many IPs abusing the
  // per-IP allowance.
  const { allowed } = await checkRateLimit({ key: `forgot-password:${ip}`, limit: 5, windowMs: 10 * 60 * 1000 });
  if (!allowed) return rateLimitResponse();

  const body = await request.json();
  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  const emailLimit = await checkRateLimit({ key: `forgot-password-email:${email}`, limit: 3, windowMs: 15 * 60 * 1000 });
  if (!emailLimit.allowed) return NextResponse.json(GENERIC_RESPONSE);

  const user = await db.query.users.findFirst({ where: eq(users.email, email) });

  if (user && user.accountStatus === "active") {
    const token = crypto.randomUUID();
    const expiresAt = addHours(new Date(), 1).toISOString();

    await db.update(users).set({ resetToken: token, resetTokenExpiresAt: expiresAt }).where(eq(users.id, user.id));

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const resetUrl = `${appUrl}/reset-password?token=${token}`;

    try {
      await sendEmail({ to: user.email, subject: "Reset your Sprintly password", html: passwordResetEmail(resetUrl) });
    } catch (error) {
      // Don't leak send failures to the client — same generic response either way.
      console.error("[forgot-password] failed to send email:", error);
    }
  }

  return NextResponse.json(GENERIC_RESPONSE);
}
