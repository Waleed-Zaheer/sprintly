"use client";

import { useEffect, useRef, useState } from "react";
import { formatDuration } from "date-fns";
import { Play, Square } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/sonner";

type TimeEntry = {
  id: string;
  note: string | null;
  startedAt: string;
  endedAt: string | null;
  durationSeconds: number | null;
};

function elapsedSeconds(startedAt: string) {
  return Math.max(0, Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000));
}

function formatClock(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

export function TimerWidget() {
  const [active, setActive] = useState<TimeEntry | null>(null);
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [note, setNote] = useState("");
  const [, forceTick] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function load() {
    try {
      const res = await fetch("/api/time-entries");
      const data = await res.json();
      setActive(data.active);
      setEntries(data.entries ?? []);
    } finally {
      setInitialLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (active) {
      intervalRef.current = setInterval(() => forceTick((t) => t + 1), 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [active]);

  async function start() {
    setLoading(true);
    try {
      const res = await fetch("/api/time-entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: note || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Couldn't start the timer.");
        return;
      }
      setNote("");
      await load();
    } finally {
      setLoading(false);
    }
  }

  async function stop() {
    setLoading(true);
    try {
      const res = await fetch("/api/time-entries/stop", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Couldn't stop the timer.");
        return;
      }
      await load();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardContent>
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-muted">Timer</h2>
          {!initialLoading && active && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-danger">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-danger opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-danger" />
              </span>
              Recording
            </span>
          )}
        </div>

        {initialLoading ? (
          <>
            <Skeleton className="mt-3 h-10 w-40" />
            <Skeleton className="mt-4 h-10 w-full" />
          </>
        ) : (
          <>
            <div className="mt-3 font-mono text-4xl font-bold tabular-nums">
              {active ? formatClock(elapsedSeconds(active.startedAt)) : "00:00:00"}
            </div>

            {active ? (
              <div className="mt-4 flex items-center gap-3">
                <p className="flex-1 truncate text-sm text-muted">{active.note || "Untitled session"}</p>
                <Button onClick={stop} disabled={loading} variant="destructive">
                  <Square className="h-3.5 w-3.5" fill="currentColor" />
                  Stop
                </Button>
              </div>
            ) : (
              <div className="mt-4 flex items-center gap-3">
                <Input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="What are you working on?"
                  className="flex-1"
                />
                <Button onClick={start} disabled={loading}>
                  <Play className="h-3.5 w-3.5" fill="currentColor" />
                  Start
                </Button>
              </div>
            )}
          </>
        )}

        {entries.length > 0 && (
          <div className="mt-6 border-t border-border pt-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Recent sessions</p>
            <ul className="mt-2 space-y-2">
              {entries.slice(0, 5).map((entry) => (
                <li key={entry.id} className="flex items-center justify-between text-sm">
                  <span className="truncate text-foreground/90">{entry.note || "Untitled session"}</span>
                  <span className="shrink-0 text-muted">
                    {entry.durationSeconds != null
                      ? formatDuration({ minutes: Math.round(entry.durationSeconds / 60) })
                      : "in progress"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
