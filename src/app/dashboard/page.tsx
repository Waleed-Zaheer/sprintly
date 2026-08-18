import { TimerWidget } from "@/components/dashboard/TimerWidget";
import { ActiveSprintCard } from "@/components/dashboard/ActiveSprintCard";

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-heading text-2xl font-semibold">Overview</h1>
      <p className="mt-1 text-muted">Track your time and keep an eye on your active sprints.</p>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <TimerWidget />
        <ActiveSprintCard />
      </div>
    </div>
  );
}
