import { TimerWidget } from "@/components/dashboard/TimerWidget";
import { ActiveSprintCard } from "@/components/dashboard/ActiveSprintCard";
import { TotalTimeWidget } from "@/components/dashboard/TotalTimeWidget";
import { requireUser } from "@/lib/auth/require";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  const user = await requireUser();
  const firstName = user?.name.split(" ")[0] ?? "there";

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-heading text-2xl font-semibold">
        {getGreeting()}, {firstName}
      </h1>
      <p className="mt-1 text-muted">Here's where your time and sprints stand right now.</p>

      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <TimerWidget />
        <ActiveSprintCard />
        <TotalTimeWidget />
      </div>
    </div>
  );
}
