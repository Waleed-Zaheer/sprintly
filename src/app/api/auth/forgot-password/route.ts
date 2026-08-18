import { NextResponse } from "next/server";
import { addHours } from "date-fns";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { forgotPasswordSchema } from "@/lib/validation";
import { sendEmail, passwordResetEmail } from "@/lib/email";

// Always returns the same generic response, whether or not the email is
// registered — otherwise this endpoint becomes a way to enumerate accounts.
const GENERIC_RESPONSE = { message: "If that email is registered, we've sent a password reset link." };

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
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
