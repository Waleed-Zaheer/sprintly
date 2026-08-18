// One-off CLI to grant/revoke platform-admin access (the /admin dashboard —
// separate from a company's owner/admin/member role). There's no signup flow
// for this on purpose; run it directly against the database.
//
// Usage:
//   npm run admin:promote -- someone@example.com
//   npm run admin:promote -- someone@example.com --revoke
import "dotenv/config";
import { eq } from "drizzle-orm";
import { db } from "../src/lib/db/client";
import { users } from "../src/lib/db/schema";

const [emailArg, ...rest] = process.argv.slice(2);
const revoke = rest.includes("--revoke");

if (!emailArg) {
  console.error("Usage: npm run admin:promote -- <email> [--revoke]");
  process.exit(1);
}

async function main() {
  const email = emailArg.toLowerCase();
  const user = await db.query.users.findFirst({ where: eq(users.email, email) });

  if (!user) {
    console.error(`No user found with email ${email}`);
    process.exit(1);
  }

  await db.update(users).set({ isPlatformAdmin: !revoke }).where(eq(users.id, user.id));
  console.log(`${email} is ${revoke ? "no longer" : "now"} a platform admin.`);
}

main();
