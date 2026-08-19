"use client";

import { useEffect, useState } from "react";
import { Clock3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function formatHours(totalSeconds: number) {
  const hours = totalSeconds / 3600;
  return hours >= 10 ? Math.round(hours).toString() : hours.toFixed(1);
}

export function TotalTimeWidget() {
  const [summary, setSummary] = useState<{ totalSeconds: number; weekSeconds: number } | null>(null);

  useEffect(() => {
    fetch("/api/time-entries")
      .then((res) => res.json())
      .then((data) => setSummary(data.summary ?? { totalSeconds: 0, weekSeconds: 0 }));
  }, []);

  return (
    <Card>
      <CardContent>
        <div className="flex items-center gap-1.5 text-xs font-medium text-muted">
          <Clock3 className="h-3.5 w-3.5" />
          Time tracked
        </div>

        {summary === null ? (
          <>
            <Skeleton className="mt-3 h-9 w-24" />
            <Skeleton className="mt-3 h-4 w-32" />
          </>
        ) : (
          <>
            <p className="mt-2 font-heading text-3xl font-semibold tabular-nums tracking-tight">
              {formatHours(summary.totalSeconds)}
              <span className="ml-1 text-base font-normal text-muted">hrs total</span>
            </p>
            <p className="mt-2 text-xs text-muted">{formatHours(summary.weekSeconds)} hrs this week</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
