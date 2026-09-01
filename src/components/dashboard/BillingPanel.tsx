"use client";

import { useEffect, useState } from "react";
import { CreditCard } from "lucide-react";
import { PLAN_DEFINITIONS, PLAN_LIST } from "@/lib/plans";
import type { Plan } from "@/lib/db/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/sonner";

type Subscription = {
  plan: Plan;
  status: string;
  trialEndsAt: string | null;
};

const STATUS_BADGE: Record<string, { variant: "secondary" | "outline"; className?: string }> = {
  active: { variant: "outline", className: "border-success/30 bg-success/10 text-success" },
  trialing: { variant: "outline", className: "border-accent/30 bg-accent/10 text-accent" },
  past_due: { variant: "outline", className: "border-warning/30 bg-warning/10 text-warning" },
  canceled: { variant: "secondary" },
  expired: { variant: "secondary" },
};

export function BillingPanel() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loadingPlan, setLoadingPlan] = useState<Plan | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        setSubscription(data.subscription ?? null);
        setLoading(false);
      });
  }, []);

  async function upgrade(plan: Plan) {
    setLoadingPlan(plan);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error ?? "Something went wrong — try again.");
      }
    } finally {
      setLoadingPlan(null);
    }
  }

  async function openPortal() {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error ?? "Something went wrong — try again.");
      }
    } finally {
      setPortalLoading(false);
    }
  }

  const currentPlan = subscription ? PLAN_DEFINITIONS[subscription.plan] : null;

  return (
    <div className="space-y-6">
      {loading ? (
        <Card>
          <CardContent>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-2 h-7 w-40" />
            <Skeleton className="mt-4 h-9 w-32" />
          </CardContent>
        </Card>
      ) : (
        currentPlan && (
          <Card>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted">
                <CreditCard className="h-5 w-5 text-primary" />
                Current plan
              </div>
              <p className="mt-1 text-xl font-bold">{currentPlan.name}</p>
              <div className="mt-2 flex items-center gap-2 text-sm text-muted">
                Status:
                <Badge {...((subscription && STATUS_BADGE[subscription.status]) ?? { variant: "secondary" as const })}>
                  {subscription?.status.replace("_", " ")}
                </Badge>
              </div>
              {subscription?.trialEndsAt && (
                <p className="mt-1 text-sm text-muted">
                  Trial ends {new Date(subscription.trialEndsAt).toLocaleDateString()}
                </p>
              )}
              <Button onClick={openPortal} disabled={portalLoading} variant="outline" className="mt-4">
                {portalLoading ? "Opening…" : "Manage billing"}
              </Button>
            </CardContent>
          </Card>
        )
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {PLAN_LIST.filter((p) => p.stripePriceEnv).map((plan) => {
          const isCurrent = subscription?.plan === plan.id && subscription.status !== "canceled" && subscription.status !== "expired";
          return (
            <Card key={plan.id} className={isCurrent ? "ring-2 ring-primary" : undefined}>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{plan.name}</p>
                  {isCurrent && <Badge className="border-primary/30 bg-primary/10 text-primary">Current</Badge>}
                </div>
                <p className="mt-1 text-2xl font-bold">
                  ${plan.priceMonthly}
                  <span className="text-sm font-normal text-muted">/mo</span>
                </p>
                <Button
                  onClick={() => upgrade(plan.id)}
                  disabled={loadingPlan === plan.id || isCurrent}
                  variant={isCurrent ? "outline" : "default"}
                  className="mt-4 w-full"
                >
                  {isCurrent ? "Current plan" : loadingPlan === plan.id ? "Redirecting…" : `Switch to ${plan.name}`}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
