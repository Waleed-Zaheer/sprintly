import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { companies, invitations } from "@/lib/db/schema";

// Public (no auth) — the token itself (a random UUID) is the credential.
export async function GET(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const invitation = await db.query.invitations.findFirst({ where: eq(invitations.token, token) });

  if (!invitation || invitation.status !== "pending" || new Date(invitation.expiresAt) < new Date()) {
    return NextResponse.json({ error: "This invite is invalid or has expired." }, { status: 404 });
  }

  const company = await db.query.companies.findFirst({ where: eq(companies.id, invitation.companyId) });

  return NextResponse.json({
    email: invitation.email,
    companyName: company?.name ?? "a company",
  });
}
