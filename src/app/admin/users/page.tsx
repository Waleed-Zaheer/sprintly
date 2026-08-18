import { AdminUsersTable } from "@/components/admin/AdminUsersTable";

export default function AdminUsersPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="font-heading text-2xl font-semibold">All users</h1>
      <p className="mt-1 text-muted">Every account across the platform, with sign-up IP and location.</p>

      <div className="mt-6">
        <AdminUsersTable />
      </div>
    </div>
  );
}
