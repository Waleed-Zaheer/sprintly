"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { differenceInCalendarDays } from "date-fns";
import { ArrowRight, ListChecks, Rocket } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty";

type Sprint = {
  id: string;
  name: string;
  goal: string | null;
  endDate: string;
  status: "planned" | "active" | "completed";
};

export function ActiveSprintCard() {
  const [sprints, setSprints] = useState<Sprint[] | null>(null);

  useEffect(() => {
    fetch("/api/sprints")
      .then((res) => res.json())
      .then((data) => setSprints(data.sprints ?? []));
  }, []);

  if (sprints === null) {
    return <Skeleton className="h-32 w-full rounded-4xl" />;
  }

  const active = sprints.find((s) => s.status === "active");
  const upNext = sprints.find((s) => s.status === "planned");
  const featured = active ?? upNext;

  if (!featured) {
    return (
      <Card>
        <CardContent>
          <Empty className="p-0">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Rocket />
              </EmptyMedia>
              <EmptyTitle>No sprint in progress</EmptyTitle>
              <EmptyDescription>Plan a sprint to start tracking work against a goal and a deadline.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button render={<Link href="/dashboard/sprints">Plan a sprint</Link>} nativeButton={false} />
            </EmptyContent>
          </Empty>
        </CardContent>
      </Card>
    );
  }

  const daysLeft = differenceInCalendarDays(new Date(featured.endDate), new Date());

  return (
    <Link href={`/dashboard/sprints/${featured.id}`}>
      <Card className="transition-shadow hover:shadow-lg hover:ring-primary/30">
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-medium text-muted">
              <ListChecks className="h-3.5 w-3.5" />
              {featured.status === "active" ? "Active sprint" : "Up next"}
            </span>
            <ArrowRight className="h-4 w-4 text-muted" />
          </div>
          <h3 className="mt-2 font-semibold">{featured.name}</h3>
          {featured.goal && <p className="mt-1 text-sm text-muted">{featured.goal}</p>}
          {featured.status === "active" && (
            <p className="mt-3 text-xs text-muted">
              {daysLeft > 0 ? `${daysLeft} day${daysLeft === 1 ? "" : "s"} left` : daysLeft === 0 ? "Ends today" : "Overdue"}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
