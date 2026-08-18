import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { getSession } from "./session";

/**
 * Fetches the current user fresh from the DB on every call (never trusts the
 * JWT beyond identifying who to look up) and returns null for a restricted
 * or disabled account, even with a still-valid session cookie — so a
 * platform-admin disabling someone takes effect immediately, not just on
 * their next login.
 */
export async function requireUser() {
  const session = await getSession();
  if (!session) return null;
  const user = await db.query.users.findFirst({ where: eq(users.id, session.sub) });
  if (!user || user.accountStatus !== "active") return null;
  return user;
}
