import { SprintDetail } from "@/components/dashboard/SprintDetail";

export default async function SprintDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="mx-auto max-w-3xl">
      <SprintDetail sprintId={id} />
    </div>
  );
}
