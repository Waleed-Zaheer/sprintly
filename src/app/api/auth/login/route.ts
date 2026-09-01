import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { verifyPassword } from "@/lib/auth/password";
import { createSessionCookie } from "@/lib/auth/session";
import { loginSchema } from "@/lib/validation";
import { getClientIp } from "@/lib/geo";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const ip = getClientIp(request) ?? "unknown";
  const { allowed } = await checkRateLimit({ key: `login:${ip}`, limit: 10, windowMs: 10 * 60 * 1000 });
  if (!allowed) return rateLimitResponse();

  const body = await request.json();
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email and password." }, { status: 400 });
  }

  const { email, password } = parsed.data;
  const user = await db.query.users.findFirst({ where: eq(users.email, email.toLowerCase()) });

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
  }

  if (user.accountStatus !== "active") {
    return NextResponse.json(
      { error: "This account has been suspended. Contact support if you believe this is a mistake." },
      { status: 403 },
    );
  }

  await createSessionCookie({
    sub: user.id,
    email: user.email,
    companyId: user.companyId,
    role: user.role,
  });

  return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
}
