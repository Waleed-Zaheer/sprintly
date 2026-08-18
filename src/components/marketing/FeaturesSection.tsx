"use client";

import { motion } from "framer-motion";
import { ListChecks, Timer, BellRing, Users, Globe2, CreditCard, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const FEATURES: { title: string; body: string; icon: LucideIcon; featured?: boolean }[] = [
  {
    title: "Sprint planning",
    body: "Create sprints with goals, dates, and tasks — for yourself or your whole team.",
    icon: ListChecks,
    featured: true,
  },
  {
    title: "One-click time tracking",
    body: "Start and stop a timer against any task, no spreadsheets or guesswork.",
    icon: Timer,
  },
  {
    title: "Desktop & browser alerts",
    body: "Real push notifications for sprint deadlines, even when the tab is closed.",
    icon: BellRing,
  },
  {
    title: "Team seats, done right",
    body: "Enterprise owners invite up to 50 teammates with role-based access.",
    icon: Users,
  },
  {
    title: "Built for the world",
    body: "Multi-language interface and international phone number validation out of the box.",
    icon: Globe2,
  },
  {
    title: "Billing that just works",
    body: "Stripe-powered subscriptions with trials, upgrades, and a self-serve billing portal.",
    icon: CreditCard,
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">Everything a sprint needs</h2>
        <p className="mt-3 text-muted">From solo trial-by-fire to a 50-person team, Sprintly scales with you.</p>
      </div>

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.45, delay: i * 0.06 }}
          >
            <Card
              className={cn(
                "h-full transition-shadow hover:shadow-lg hover:ring-primary/30",
                feature.featured && "bg-primary/3 ring-1 ring-primary/20",
              )}
            >
              <CardContent>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-heading font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted">{feature.body}</p>
                {feature.featured && (
                  <div className="mt-4 flex items-center gap-4 border-t border-border pt-4 text-xs text-muted">
                    <span className="flex items-baseline gap-1">
                      <span className="font-heading text-lg font-semibold text-foreground">3</span>
                      active sprints
                    </span>
                    <span className="flex items-baseline gap-1">
                      <span className="font-heading text-lg font-semibold text-foreground">12</span>
                      open tasks
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
