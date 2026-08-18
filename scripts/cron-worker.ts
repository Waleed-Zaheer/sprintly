// Optional standalone worker for self-hosted deployments that want finer-grained
// scheduling than Vercel's free-tier daily cron limit. Run with `npm run cron:worker`
// on any always-on Node host (a small Render/Railway/Fly worker, a VPS, etc.).
// Vercel deployments don't need this file — vercel.json already schedules the
// same two endpoints once a day for free.
import "dotenv/config";
import cron from "node-cron";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const secret = process.env.CRON_SECRET;

if (!secret) {
  throw new Error("CRON_SECRET is not set.");
}

async function trigger(path: string) {
  const res = await fetch(`${appUrl}${path}`, {
    headers: { authorization: `Bearer ${secret}` },
  });
  console.log(`[cron] ${path} -> ${res.status}`);
}

cron.schedule("0 * * * *", () => trigger("/api/cron/check-trials"));
cron.schedule("*/30 * * * *", () => trigger("/api/cron/sprint-reminders"));

console.log("Sprintly cron worker running (hourly trial checks, 30-min sprint reminders).");
