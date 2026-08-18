import type { Plan } from "@/lib/db/schema";

export type PlanDefinition = {
  id: Plan;
  name: string;
  tagline: string;
  priceMonthly: number;
  trialDays: number;
  seatLimit: number;
  stripePriceEnv?: "STRIPE_PRICE_INDIVIDUAL" | "STRIPE_PRICE_ENTERPRISE";
  features: string[];
};

export const PLAN_DEFINITIONS: Record<Plan, PlanDefinition> = {
  free: {
    id: "free",
    name: "Free",
    tagline: "Try every feature for a day, no card required.",
    priceMonthly: 0,
    trialDays: 1,
    seatLimit: 1,
    features: [
      "Full sprint & time tracking",
      "1 active sprint",
      "24-hour access window",
      "Browser & desktop notifications",
    ],
  },
  individual: {
    id: "individual",
    name: "Individual",
    tagline: "For freelancers and solo builders who track everything.",
    priceMonthly: 9,
    trialDays: 7,
    seatLimit: 1,
    stripePriceEnv: "STRIPE_PRICE_INDIVIDUAL",
    features: [
      "7-day free trial",
      "Unlimited sprints & tasks",
      "Unlimited time tracking history",
      "Push, browser & desktop notifications",
      "Data export",
    ],
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    tagline: "For teams that plan, track and ship in sprints together.",
    priceMonthly: 100,
    trialDays: 0,
    seatLimit: 50,
    stripePriceEnv: "STRIPE_PRICE_ENTERPRISE",
    features: [
      "Up to 50 team members",
      "Company-wide sprint boards",
      "Role-based access (owner/admin/member)",
      "Priority support",
      "Push, browser & desktop notifications for the whole team",
    ],
  },
};

export const PLAN_LIST = Object.values(PLAN_DEFINITIONS);
