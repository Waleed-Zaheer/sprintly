# Sprintly

Sprint planning and time tracking for individuals and companies — with real browser/desktop push notifications, Stripe billing, and multi-language support. Built on Next.js, deployable entirely on free-tier services.

## Stack

| Concern | Choice | Why |
| --- | --- | --- |
| Framework | Next.js 16 (App Router, TypeScript, Turbopack) | One codebase for the UI, API routes, cron endpoints, and Stripe webhooks — deploys free on Vercel with no separate backend to host. |
| Database | [Turso](https://turso.tech) (libSQL/SQLite) via Drizzle ORM | Generous free tier, fast, no Supabase. Falls back to a local SQLite file in dev so you don't need an account to start coding. |
| Auth | Custom JWT (`jose`) in an httpOnly cookie, `bcryptjs` for hashing | No per-user cost as company accounts scale to 50 seats. |
| Billing | Stripe Checkout + Billing Portal + webhooks | Free/Individual/Enterprise plans, trials, self-serve upgrades and cancellation. |
| Notifications | Web Notification API + Web Push (VAPID, service worker) | Real OS-level desktop notifications even when the tab is closed, not just in-tab toasts. Installable as a PWA. |
| Scheduling | Vercel Cron (`vercel.json`) + optional `node-cron` worker script | Vercel's free tier only allows daily cron; `scripts/cron-worker.ts` is there if you self-host and want hourly/30-min granularity. |
| UI | Tailwind CSS v4, Framer Motion, a small shadcn/ui-style primitive layer (`src/components/ui/`, built on `class-variance-authority` + `tailwind-merge` + Radix `Slot`), `lucide-react` icons | Consistent, themeable (light/dark) design system. |
| 3D / motion | Three.js via `@react-three/fiber` + `@react-three/drei`, `lottie-react` | Landing page hero visual and loading animations. |
| i18n | `i18next` / `react-i18next` (English + Spanish included) | `src/i18n/locales/` — add more languages by dropping in another JSON file. |
| Phone validation | `google-libphonenumber` | Validates/normalizes phone numbers to E.164 on signup. |
| Dates | `date-fns` | Formatting sprint dates and tracked durations. |
| Email | [Resend](https://resend.com) | Password-reset and team-invite emails. Free tier (100/day, 3k/month). |
| Fraud/abuse detection | [ipapi.co](https://ipapi.co) (free, no key) for sign-up geolocation | Platform admins can see which IP/location each account signed up from and spot multi-accounting — see **Admin dashboard** below. |

## Plans

Defined in `src/lib/plans.ts` — the single source of truth for pricing shown on the landing page and used by the Stripe checkout flow:

- **Free** — 1-day trial, 1 seat, no card required.
- **Individual** — $9/mo after a 7-day free trial, 1 seat.
- **Enterprise** — $100/mo flat, no trial, up to 50 seats. The signing-up user becomes the company `owner` and can invite teammates from **Dashboard → Team** (enforced server-side against the seat limit in `src/app/api/company/invite/route.ts`).

## Local development

```bash
npm install
npm run dev
```

That's it to get the app running — `src/lib/db/client.ts` automatically uses a local file database (`./sprintly-dev.db`, gitignored) when `TURSO_DATABASE_URL` isn't set, so there's nothing to configure just to start building. The schema is already pushed to that file; if you change `src/lib/db/schema.ts`, re-run:

```bash
npm run db:push
```

Auth, sprints, tasks, and time tracking all work out of the box. Stripe checkout and Web Push will no-op/error until you configure their env vars below — everything else works without them.

An `.env.local` is already present with a generated `JWT_SECRET` and `CRON_SECRET` for local dev. Don't reuse those values in production — see below.

## Setting up the real (free) services

### 1. Database — Turso

```bash
# install the CLI: https://docs.turso.tech/cli/installation
turso auth signup       # or login
turso db create sprintly
turso db show sprintly --url          # -> TURSO_DATABASE_URL
turso db tokens create sprintly       # -> TURSO_AUTH_TOKEN
```

Put both values in `.env.local` (and later in Vercel's project env vars), then run `npm run db:push` again to create the schema in the cloud database. `npm run db:studio` opens Drizzle Studio against whichever database your env vars currently point at.

### 2. Billing — Stripe

1. Create a [Stripe account](https://dashboard.stripe.com/register) (test mode is free and fully functional for development).
2. Create two **Products**, each with one recurring monthly **Price**:
   - "Sprintly Individual" — $9.00/month → copy its price ID into `STRIPE_PRICE_INDIVIDUAL`.
   - "Sprintly Enterprise" — $100.00/month → copy its price ID into `STRIPE_PRICE_ENTERPRISE`.
   (The Free plan never touches Stripe — no product needed for it.)
3. Copy your **Secret key** and **Publishable key** from the Stripe dashboard into `STRIPE_SECRET_KEY` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
4. Webhook, for local testing:

   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

   This prints a `whsec_...` value — put it in `STRIPE_WEBHOOK_SECRET`. In production, create a webhook endpoint in the Stripe dashboard pointing at `https://<your-domain>/api/stripe/webhook`, subscribed to at least `checkout.session.completed`, `customer.subscription.updated`, and `customer.subscription.deleted`, and use *that* endpoint's signing secret instead.

### 3. Push notifications — VAPID keys

```bash
npx web-push generate-vapid-keys
```

Put the public key in `NEXT_PUBLIC_VAPID_PUBLIC_KEY` and the private key in `VAPID_PRIVATE_KEY`. `VAPID_SUBJECT` should be a `mailto:` address you control. Once set, visiting the dashboard prompts users to enable notifications (`src/components/notifications/NotificationPrompt.tsx`); accepting registers a real push subscription (`src/lib/notifications/client.ts` + `public/sw.js`) that the two cron jobs and any server-side call to `sendPushToUser()` (`src/lib/push.ts`) can deliver to, including when the browser is closed.

### 4. Cron secret

Any random string — it authorizes `/api/cron/*` so they can't be triggered by outsiders:

```bash
node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"
```

### 5. Email — Resend

1. Create a [Resend account](https://resend.com) (free tier: 100 emails/day, 3,000/month).
2. Copy your API key into `RESEND_API_KEY`.
3. For real deliverability, verify your own domain in Resend and set `EMAIL_FROM` to an address on it (e.g. `"Sprintly <hello@yourdomain.com>"`). Until you do, the default `onboarding@resend.dev` sender only delivers to the email on your own Resend account — fine for testing, not for real users.

Without this configured, password-reset and team-invite requests still succeed (the invitation/token is still created), they just don't email anyone — the server logs the send failure so you can tell in dev.

## Admin dashboard

A separate, platform-wide `/admin` area (distinct from a company's own owner/admin/member roles) for reviewing accounts and detecting abuse — e.g. one person creating many accounts to repeatedly claim free trials.

- **`/admin/users`** — every account across the platform, with its sign-up IP and geolocated country/region/city, filterable by IP or location.
- **`/admin/duplicate-ips`** — accounts grouped by sign-up IP, showing only IPs shared by 2+ accounts, so you can review and act on likely multi-accounting.
- Both pages let you **restrict** or **disable** an account. Both fully block that account from logging in (restrict is meant as the softer, more-reversible label of the two) — enforcement is centralized in `requireUser()` (`src/lib/auth/require.ts`), which re-checks `accountStatus` fresh from the database on every request, so a disable takes effect immediately even if the user already has a valid session cookie.

There's no sign-up flow for platform-admin access — grant it by email from the CLI:

```bash
npm run admin:promote -- you@example.com
npm run admin:promote -- you@example.com --revoke   # to undo
```

Authorization for `/admin/*` is never cached in the JWT — every page load and API call re-checks `isPlatformAdmin` fresh from the database (`src/lib/auth/admin.ts`), the same way `accountStatus` is re-checked, so revoking access takes effect immediately rather than waiting out a session.

## Deploying for free

1. Push this repo to GitHub.
2. Import it into [Vercel](https://vercel.com/new) (free Hobby tier is enough).
3. Add every variable from `.env.example` to the Vercel project's Environment Variables, using your real Turso/Stripe/VAPID/Resend values from above, and set `NEXT_PUBLIC_APP_URL` to your production domain (e.g. `https://sprintly.vercel.app`).
4. Deploy. `vercel.json` already registers the two cron jobs (`check-trials` daily at 06:00 UTC, `sprint-reminders` daily at 18:00 UTC) — Vercel's Hobby plan only allows daily-or-less cron frequency, which is why they're scheduled once a day each rather than hourly.
5. Point your Stripe webhook (see above) at the deployed `/api/stripe/webhook` URL and update `STRIPE_WEBHOOK_SECRET` in Vercel to match.

**Wanting finer-grained reminders than once a day?** `scripts/cron-worker.ts` uses actual `node-cron` to hit `/api/cron/check-trials` hourly and `/api/cron/sprint-reminders` every 30 minutes. It needs an always-on process, so it won't run on Vercel itself — point it at your deployed app's URL and run it anywhere that stays alive (a free Render/Railway worker, a small VPS, even your own machine): `npm run cron:worker` (reads `NEXT_PUBLIC_APP_URL` and `CRON_SECRET` from its environment).

## Project structure

```text
src/
  app/
    (auth)/login, register, forgot-password, reset-password — share src/app/(auth)/layout.tsx
    invite/[token]                    — team-invite acceptance (its own shell, not in the (auth) group)
    dashboard/                        — protected app shell (src/middleware.ts guards /dashboard/*)
    admin/                            — platform-admin dashboard (src/middleware.ts guards /admin/*,
                                         src/app/admin/layout.tsx does the real isPlatformAdmin check)
    privacy/, terms/                  — legal pages (src/components/legal/LegalLayout.tsx)
    api/                              — auth (incl. forgot/reset-password), company invites, invitations
                                         accept, sprints, tasks, time-entries, stripe (checkout/portal/
                                         webhook), notifications, cron, admin (users, duplicate-ips)
  components/
    ui/                                — Button, Card, Input, Badge, Table, etc. primitives (cva + tailwind-merge)
    marketing/, dashboard/, auth/,
    admin/, legal/                     — page-level composed components
  lib/
    db/schema.ts                       — Drizzle schema (companies, users, subscriptions,
                                          invitations, sprints, tasks, time_entries, push_subscriptions)
    db/client.ts                       — Turso client, with the local-file dev fallback
    auth/                              — password hashing, JWT sign/verify, session cookie helpers,
                                          requireUser() (also enforces accountStatus), requirePlatformAdmin()
    geo.ts                             — client-IP extraction + best-effort IP geolocation
    email.ts                           — Resend wrapper + email templates
    plans.ts                           — pricing/plan definitions (single source of truth)
    push.ts                            — server-side Web Push sender
    stripe.ts                          — Stripe client
  i18n/                                 — i18next config + locale JSON
public/
  sw.js                                 — push notification service worker
  manifest.json                         — PWA manifest (installable desktop app)
scripts/cron-worker.ts                  — optional self-hosted node-cron runner (see above)
scripts/promote-admin.ts                — grant/revoke platform-admin access by email (see Admin dashboard above)
```

## Notes

- The seat-limit check in the invite route is a best-effort count check, not a database-level constraint — fine at this scale, worth revisiting with a unique constraint or transaction if invite volume gets heavy.
- `/privacy` and `/terms` are a starting-point template, not legal advice — have them reviewed before relying on them, and fill in the governing-law placeholder in `/terms`.
- Sign-up IP geolocation (`src/lib/geo.ts`) uses ipapi.co's free tier (no key, ~1k requests/day) and fails gracefully — registration never blocks on it. For higher volume or stronger privacy guarantees, consider a self-hosted GeoIP database (e.g. MaxMind GeoLite2) instead.
