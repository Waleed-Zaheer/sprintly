import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/require";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { NotificationPrompt } from "@/components/notifications/NotificationPrompt";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen flex-1">
      <Sidebar name={user.name} email={user.email} />
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
      <NotificationPrompt />
    </div>
  );
}
