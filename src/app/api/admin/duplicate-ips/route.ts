import { NextResponse } from "next/server";
import { desc, eq, inArray, isNotNull, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { companies, users } from "@/lib/db/schema";
import { requirePlatformAdmin } from "@/lib/auth/admin";

export async function GET() {
  const admin = await requirePlatformAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const grouped = await db
    .select({ ip: users.signupIp, count: sql<number>`count(*)`.as("count") })
    .from(users)
    .where(isNotNull(users.signupIp))
    .groupBy(users.signupIp)
    .having(sql`count(*) >= 2`)
    .orderBy(desc(sql`count(*)`));

  const ips = grouped.map((g) => g.ip).filter((ip): ip is string => ip !== null);
  if (ips.length === 0) {
    return NextResponse.json({ groups: [] });
  }

  const accounts = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      accountStatus: users.accountStatus,
      signupIp: users.signupIp,
      signupCountry: users.signupCountry,
      signupRegion: users.signupRegion,
      signupCity: users.signupCity,
      createdAt: users.createdAt,
      companyName: companies.name,
    })
    .from(users)
    .leftJoin(companies, eq(users.companyId, companies.id))
    .where(inArray(users.signupIp, ips));

  const accountsByIp = new Map<string, typeof accounts>();
  for (const account of accounts) {
    if (!account.signupIp) continue;
    const list = accountsByIp.get(account.signupIp) ?? [];
    list.push(account);
    accountsByIp.set(account.signupIp, list);
  }

  const groups = grouped
    .filter((g): g is { ip: string; count: number } => g.ip !== null)
    .map((g) => {
      const groupAccounts = accountsByIp.get(g.ip) ?? [];
      const sample = groupAccounts[0];
      return {
        ip: g.ip,
        count: g.count,
        country: sample?.signupCountry ?? null,
        region: sample?.signupRegion ?? null,
        city: sample?.signupCity ?? null,
        accounts: groupAccounts,
      };
    });

  return NextResponse.json({ groups });
}
