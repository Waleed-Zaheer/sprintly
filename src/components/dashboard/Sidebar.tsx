"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, ListChecks, Users, CreditCard, LogOut, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";

const LINKS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/sprints", label: "Sprints", icon: ListChecks },
  { href: "/dashboard/team", label: "Team", icon: Users },
  { href: "/dashboard/settings/billing", label: "Billing", icon: CreditCard },
];

export function Sidebar({ name, email }: { name: string; email: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <aside className="flex w-64 flex-col border-r border-border p-4">
      <Link href="/" className="mb-6 flex items-center gap-2 px-2 font-heading text-lg font-bold tracking-tight">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Zap className="h-4 w-4" fill="currentColor" strokeWidth={0} />
        </span>
        Sprint<span className="gradient-text">ly</span>
      </Link>

      <nav className="flex-1 space-y-1">
        {LINKS.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active ? "bg-primary/10 text-primary" : "text-muted hover:bg-surface hover:text-foreground",
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 border-t border-border pt-4">
        <p className="truncate text-sm font-medium">{name}</p>
        <p className="truncate text-xs text-muted">{email}</p>
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={handleLogout}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:text-foreground"
          >
            <LogOut className="h-3.5 w-3.5" />
            Log out
          </button>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
