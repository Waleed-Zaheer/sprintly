import { SprintBoard } from "@/components/dashboard/SprintBoard";

export default function SprintsPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-heading text-2xl font-semibold">Sprints</h1>
      <p className="mt-1 text-muted">Plan sprints and track their progress from kickoff to close.</p>

      <div className="mt-6">
        <SprintBoard />
      </div>
    </div>
  );
}
