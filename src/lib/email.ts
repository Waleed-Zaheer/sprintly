import { Resend } from "resend";

let _resend: Resend | null = null;

function getResend() {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key) {
      throw new Error("RESEND_API_KEY is not set. Copy .env.example to .env.local and fill it in.");
    }
    _resend = new Resend(key);
  }
  return _resend;
}

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const from = process.env.EMAIL_FROM ?? "Sprintly <onboarding@resend.dev>";
  const resend = getResend();
  const { error } = await resend.emails.send({ from, to, subject, html });
  if (error) throw new Error(error.message);
}

function emailShell(bodyHtml: string) {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; color: #14141f;">
      <p style="font-weight: 700; font-size: 18px; margin-bottom: 24px;">
        Sprint<span style="color: #6d5efc;">ly</span>
      </p>
      ${bodyHtml}
      <p style="margin-top: 32px; font-size: 12px; color: #6b6b80;">Sprintly — sprint planning and time tracking.</p>
    </div>
  `;
}

export function passwordResetEmail(resetUrl: string) {
  return emailShell(`
    <p>We got a request to reset your Sprintly password. This link expires in 1 hour.</p>
    <p style="margin: 24px 0;">
      <a href="${resetUrl}" style="background: #6d5efc; color: #fff; padding: 10px 20px; border-radius: 999px; text-decoration: none; font-weight: 600;">
        Reset password
      </a>
    </p>
    <p style="font-size: 13px; color: #6b6b80;">If you didn't request this, you can safely ignore this email.</p>
  `);
}

export function teamInviteEmail(companyName: string, inviteUrl: string) {
  return emailShell(`
    <p><strong>${companyName}</strong> invited you to join their team on Sprintly.</p>
    <p style="margin: 24px 0;">
      <a href="${inviteUrl}" style="background: #6d5efc; color: #fff; padding: 10px 20px; border-radius: 999px; text-decoration: none; font-weight: 600;">
        Accept invite
      </a>
    </p>
    <p style="font-size: 13px; color: #6b6b80;">This invite expires in 7 days.</p>
  `);
}

export function paymentFailedEmail(billingUrl: string) {
  return emailShell(`
    <p>We couldn't charge your card for your Sprintly subscription. Your access continues for now, but please update your payment method to avoid an interruption.</p>
    <p style="margin: 24px 0;">
      <a href="${billingUrl}" style="background: #6d5efc; color: #fff; padding: 10px 20px; border-radius: 999px; text-decoration: none; font-weight: 600;">
        Update payment method
      </a>
    </p>
  `);
}

export function trialEndingEmail(billingUrl: string) {
  return emailShell(`
    <p>Your Sprintly trial ends in a few days. Add a payment method to keep your sprints, tasks, and time entries without interruption.</p>
    <p style="margin: 24px 0;">
      <a href="${billingUrl}" style="background: #6d5efc; color: #fff; padding: 10px 20px; border-radius: 999px; text-decoration: none; font-weight: 600;">
        Choose a plan
      </a>
    </p>
  `);
}
