import { NextResponse } from "next/server";
import { addDays } from "date-fns";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { companies, invitations, users } from "@/lib/db/schema";
import { requireUser } from "@/lib/auth/require";
import { inviteSchema } from "@/lib/validation";
import { sendEmail, teamInviteEmail } from "@/lib/email";

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user || !user.companyId || (user.role !== "owner" && user.role !== "admin")) {
    return NextResponse.json({ error: "Only a company owner or admin can invite members." }, { status: 403 });
  }

  const body = await request.json();
  const parsed = inviteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const company = await db.query.companies.findFirst({ where: eq(companies.id, user.companyId) });
  if (!company) {
    return NextResponse.json({ error: "Company not found." }, { status: 404 });
  }

  const memberCount = (await db.query.users.findMany({ where: eq(users.companyId, company.id) })).length;
  const pendingInvites = (
    await db.query.invitations.findMany({
      where: and(eq(invitations.companyId, company.id), eq(invitations.status, "pending")),
    })
  ).length;

  if (memberCount + pendingInvites >= company.seatLimit) {
    return NextResponse.json(
      { error: `Seat limit reached. This plan allows up to ${company.seatLimit} users.` },
      { status: 409 },
    );
  }

  const existingMember = await db.query.users.findFirst({
    where: and(eq(users.email, parsed.data.email.toLowerCase()), eq(users.companyId, company.id)),
  });
  if (existingMember) {
    return NextResponse.json({ error: "That person is already on your team." }, { status: 409 });
  }

  const invitation = {
    id: crypto.randomUUID(),
    companyId: company.id,
    email: parsed.data.email.toLowerCase(),
    token: crypto.randomUUID(),
    invitedBy: user.id,
    expiresAt: addDays(new Date(), 7).toISOString(),
  };

  await db.insert(invitations).values(invitation);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const inviteUrl = `${appUrl}/invite/${invitation.token}`;

  try {
    await sendEmail({
      to: invitation.email,
      subject: `${company.name} invited you to Sprintly`,
      html: teamInviteEmail(company.name, inviteUrl),
    });
  } catch (error) {
    console.error("[company/invite] failed to send email:", error);
  }

  return NextResponse.json({ invitation });
}

export async function GET() {
  const user = await requireUser();
  if (!user || !user.companyId) {
    return NextResponse.json({ error: "Not part of a company." }, { status: 403 });
  }

  const [members, pending, company] = await Promise.all([
    db.query.users.findMany({ where: eq(users.companyId, user.companyId) }),
    db.query.invitations.findMany({
      where: and(eq(invitations.companyId, user.companyId), eq(invitations.status, "pending")),
    }),
    db.query.companies.findFirst({ where: eq(companies.id, user.companyId) }),
  ]);

  return NextResponse.json({
    members: members.map((m) => ({ id: m.id, name: m.name, email: m.email, role: m.role })),
    pending,
    seatLimit: company?.seatLimit ?? 0,
    seatsUsed: members.length + pending.length,
  });
}

