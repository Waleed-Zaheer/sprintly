import { NextResponse } from "next/server";
import { and, desc, eq, like, or, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { companies, users } from "@/lib/db/schema";
import { requirePlatformAdmin } from "@/lib/auth/admin";

const DEFAULT_LIMIT = 50;

export async function GET(request: Request) {
  const admin = await requirePlatformAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const url = new URL(request.url);
  const ip = url.searchParams.get("ip")?.trim();
  const location = url.searchParams.get("location")?.trim();
  const limit = Math.min(Number(url.searchParams.get("limit")) || DEFAULT_LIMIT, 200);
  const offset = Math.max(Number(url.searchParams.get("offset")) || 0, 0);

  const conditions = [];
  if (ip) conditions.push(like(users.signupIp, `%${ip}%`));
  if (location) {
    const term = `%${location}%`;
    conditions.push(or(like(users.signupCountry, term), like(users.signupRegion, term), like(users.signupCity, term)));
  }
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      accountStatus: users.accountStatus,
      signupIp: users.signupIp,
      signupCountry: users.signupCountry,
      signupRegion: users.signupRegion,
      signupCity: users.signupCity,
      createdAt: users.createdAt,
      isPlatformAdmin: users.isPlatformAdmin,
      companyName: companies.name,
    })
    .from(users)
    .leftJoin(companies, eq(users.companyId, companies.id))
    .where(where)
    .orderBy(desc(users.createdAt))
    .limit(limit)
    .offset(offset);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(where);

  return NextResponse.json({ users: rows, total: count, limit, offset });
}
