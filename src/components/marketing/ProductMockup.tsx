import { Play, ListChecks, ArrowRight } from "lucide-react";

/**
 * A static rendering of Sprintly's own dashboard — same tokens, same card
 * shapes, same timer/sprint components — inside a browser-window frame.
 * Deliberately NOT abstract 3D shapes: a real (if fake-data) product
 * screenshot reads as an actual product, not a generated placeholder.
 */
export function ProductMockup() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-xl">
      <div className="flex items-center gap-2 border-b border-border bg-secondary/60 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-danger/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
        <span className="ml-3 rounded-md bg-surface px-3 py-1 font-mono text-[11px] text-muted">
          sprintly.app/dashboard
        </span>
      </div>

      <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5">
        <div className="rounded-2xl border border-border bg-surface p-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-danger opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-danger" />
            </span>
            Recording
          </div>
          <p className="mt-2 font-heading text-3xl font-semibold tabular-nums tracking-tight">00:24:13</p>
          <div className="mt-3 flex items-center justify-between rounded-lg bg-secondary/60 px-2.5 py-1.5 text-xs text-foreground/80">
            <span className="truncate">Fix onboarding checkout flow</span>
            <Play className="h-3 w-3 shrink-0 text-primary" fill="currentColor" />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-4">
          <div className="flex items-center justify-between text-xs font-medium text-muted">
            <span className="flex items-center gap-1.5">
              <ListChecks className="h-3.5 w-3.5" />
              Active sprint
            </span>
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
          <p className="mt-2 font-heading text-sm font-semibold">Launch Week</p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary">
            <div className="h-full w-2/3 rounded-full bg-primary" />
          </div>
          <p className="mt-2 text-xs text-muted">7 of 10 tasks done · 3 days left</p>
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-border bg-surface p-3 text-xs sm:col-span-2">
          <span className="text-foreground/80">Weekly check-in</span>
          <span className="rounded-full bg-success/10 px-2 py-0.5 font-medium text-success">on track</span>
        </div>
      </div>
    </div>
  );
}
