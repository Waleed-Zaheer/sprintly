"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";
import { PLAN_LIST } from "@/lib/plans";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function PricingSection() {
  const { t } = useTranslation();

  return (
    <section id="pricing" className="mx-auto max-w-6xl px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">{t("pricing.title")}</h2>
        <p className="mt-3 text-muted">{t("pricing.subtitle")}</p>
      </div>

      <div className="mt-14 grid gap-6 sm:grid-cols-3">
        {PLAN_LIST.map((plan, i) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="relative h-full"
          >
            {plan.id === "enterprise" && (
              <Badge className="absolute -top-3 left-6 z-10" variant="default">
                Most popular
              </Badge>
            )}
            <Card
              className={`flex h-full flex-col ${plan.id === "enterprise" ? "border-primary shadow-[0_0_0_1px_var(--primary)]" : ""}`}
            >
              <CardContent className="flex h-full flex-col">
                <h3 className="font-heading text-lg font-semibold">{plan.name}</h3>
                <p className="mt-1 text-sm text-muted">{plan.tagline}</p>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-bold">${plan.priceMonthly}</span>
                  <span className="text-sm text-muted">{plan.priceMonthly > 0 ? t("pricing.perMonth") : ""}</span>
                </div>
                <p className="mt-1 text-xs text-muted">
                  {plan.trialDays > 0
                    ? `${plan.trialDays}-day free trial`
                    : `Up to ${plan.seatLimit} ${t("pricing.seats")}`}
                </p>

                <ul className="mt-6 flex-1 space-y-3 text-sm">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                      <span className="text-foreground/90">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.id === "enterprise" ? "default" : "outline"}
                  className="mt-8 w-full"
                  nativeButton={false}
                  render={
                    <Link href={`/register?plan=${plan.id}`}>
                      {plan.priceMonthly === 0 ? "Start free" : "Choose plan"}
                    </Link>
                  }
                />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
