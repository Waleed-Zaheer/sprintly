import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, uniqueIndex, index, primaryKey } from "drizzle-orm/sqlite-core";

const id = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());

const timestamps = {
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(current_timestamp)`),
};

export const plans = ["free", "individual", "enterprise"] as const;
export type Plan = (typeof plans)[number];

export const companies = sqliteTable("companies", {
  id: id(),
  name: text("name").notNull(),
  ownerId: text("owner_id").notNull(),
  plan: text("plan").$type<Plan>().notNull().default("free"),
  seatLimit: integer("seat_limit").notNull().default(1),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  ...timestamps,
});

export const accountStatuses = ["active", "restricted", "disabled"] as const;
export type AccountStatus = (typeof accountStatuses)[number];

export const users = sqliteTable(
  "users",
  {
    id: id(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    passwordHash: text("password_hash").notNull(),
    companyId: text("company_id").references(() => companies.id),
    role: text("role").$type<"owner" | "admin" | "member">().notNull().default("member"),
    locale: text("locale").notNull().default("en"),
    // Captured once at registration — the account's "identity" IP/location,
    // used for platform-admin abuse review (shared-IP multi-accounting).
    // Best-effort: null when geolocation fails or the request has no
    // resolvable public IP (e.g. local dev).
    signupIp: text("signup_ip"),
    signupCountry: text("signup_country"),
    signupRegion: text("signup_region"),
    signupCity: text("signup_city"),
    accountStatus: text("account_status").$type<AccountStatus>().notNull().default("active"),
    isPlatformAdmin: integer("is_platform_admin", { mode: "boolean" }).notNull().default(false),
    // A new request overwrites these, invalidating any previously-issued
    // reset link. Cleared once the reset is used.
    resetToken: text("reset_token"),
    resetTokenExpiresAt: text("reset_token_expires_at"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("users_email_idx").on(table.email),
    index("users_company_idx").on(table.companyId),
    index("users_signup_ip_idx").on(table.signupIp),
    index("users_reset_token_idx").on(table.resetToken),
  ],
);

export const subscriptions = sqliteTable(
  "subscriptions",
  {
    id: id(),
    companyId: text("company_id").references(() => companies.id),
    userId: text("user_id").references(() => users.id),
    plan: text("plan").$type<Plan>().notNull().default("free"),
    status: text("status")
      .$type<"trialing" | "active" | "past_due" | "canceled" | "expired">()
      .notNull()
      .default("trialing"),
    trialEndsAt: text("trial_ends_at"),
    currentPeriodEnd: text("current_period_end"),
    stripeSubscriptionId: text("stripe_subscription_id"),
    stripePriceId: text("stripe_price_id"),
    ...timestamps,
  },
  (table) => [
    index("subscriptions_company_idx").on(table.companyId),
    index("subscriptions_user_idx").on(table.userId),
    index("subscriptions_stripe_sub_idx").on(table.stripeSubscriptionId),
    index("subscriptions_status_trial_idx").on(table.status, table.trialEndsAt),
  ],
);

// Records every Stripe webhook event we've finished processing, so a
// retried delivery (Stripe guarantees at-least-once, including resends
// after a success) is a no-op instead of re-running the state change.
export const processedStripeEvents = sqliteTable("processed_stripe_events", {
  eventId: text("event_id").primaryKey(),
  type: text("type").notNull(),
  processedAt: text("processed_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

// Fixed-window request counters for rate limiting (login, register,
// forgot-password). Backed by the same DB rather than a new Redis/KV
// service, since a request every 1-15 minutes per key is well within
// SQLite's write throughput and avoids adding a paid dependency.
export const rateLimitHits = sqliteTable(
  "rate_limit_hits",
  {
    key: text("key").notNull(),
    windowStart: integer("window_start").notNull(),
    count: integer("count").notNull().default(0),
  },
  (table) => [primaryKey({ columns: [table.key, table.windowStart] })],
);

export const invitations = sqliteTable(
  "invitations",
  {
    id: id(),
    companyId: text("company_id")
      .notNull()
      .references(() => companies.id),
    email: text("email").notNull(),
    token: text("token").notNull(),
    invitedBy: text("invited_by").notNull(),
    status: text("status").$type<"pending" | "accepted" | "revoked">().notNull().default("pending"),
    expiresAt: text("expires_at").notNull(),
    ...timestamps,
  },
  (table) => [
    index("invitations_company_status_idx").on(table.companyId, table.status),
    index("invitations_token_idx").on(table.token),
  ],
);

export const sprints = sqliteTable(
  "sprints",
  {
    id: id(),
    ownerId: text("owner_id").notNull(),
    companyId: text("company_id").references(() => companies.id),
    name: text("name").notNull(),
    goal: text("goal"),
    startDate: text("start_date").notNull(),
    endDate: text("end_date").notNull(),
    status: text("status").$type<"planned" | "active" | "completed">().notNull().default("planned"),
    ...timestamps,
  },
  (table) => [
    index("sprints_company_idx").on(table.companyId),
    index("sprints_owner_idx").on(table.ownerId),
    index("sprints_status_end_idx").on(table.status, table.endDate),
  ],
);

export const tasks = sqliteTable(
  "tasks",
  {
    id: id(),
    sprintId: text("sprint_id")
      .notNull()
      .references(() => sprints.id),
    title: text("title").notNull(),
    description: text("description"),
    assigneeId: text("assignee_id").references(() => users.id),
    estimateMinutes: integer("estimate_minutes"),
    status: text("status").$type<"todo" | "in_progress" | "done">().notNull().default("todo"),
    ...timestamps,
  },
  (table) => [index("tasks_sprint_idx").on(table.sprintId), index("tasks_assignee_idx").on(table.assigneeId)],
);

export const timeEntries = sqliteTable(
  "time_entries",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    taskId: text("task_id").references(() => tasks.id),
    sprintId: text("sprint_id").references(() => sprints.id),
    note: text("note"),
    startedAt: text("started_at").notNull(),
    endedAt: text("ended_at"),
    durationSeconds: integer("duration_seconds"),
    ...timestamps,
  },
  (table) => [
    index("time_entries_user_idx").on(table.userId),
    index("time_entries_task_idx").on(table.taskId),
    index("time_entries_user_open_idx").on(table.userId, table.endedAt),
    // A user can have at most one open (not-yet-stopped) timer at a time —
    // enforced here, not just in application code, so a double-click or a
    // duplicate request can't create two and corrupt duration reporting.
    uniqueIndex("time_entries_one_running_idx").on(table.userId).where(sql`${table.endedAt} is null`),
  ],
);

export const pushSubscriptions = sqliteTable(
  "push_subscriptions",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    endpoint: text("endpoint").notNull(),
    p256dh: text("p256dh").notNull(),
    auth: text("auth").notNull(),
    ...timestamps,
  },
  (table) => [index("push_subscriptions_user_idx").on(table.userId)],
);
