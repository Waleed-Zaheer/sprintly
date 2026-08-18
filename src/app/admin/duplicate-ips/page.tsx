import { DuplicateIpsTable } from "@/components/admin/DuplicateIpsTable";

export default function DuplicateIpsPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-heading text-2xl font-semibold">Duplicate IPs</h1>
      <p className="mt-1 text-muted">
        Accounts that share a sign-up IP address — review for multi-accounting abuse.
      </p>

      <div className="mt-6">
        <DuplicateIpsTable />
      </div>
    </div>
  );
}
