import { TeamPanel } from "@/components/dashboard/TeamPanel";

export default function TeamPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-heading text-2xl font-semibold">Team</h1>
      <p className="mt-1 text-muted">Manage who has access to your company's sprints and time tracking.</p>

      <div className="mt-6">
        <TeamPanel />
      </div>
    </div>
  );
}
