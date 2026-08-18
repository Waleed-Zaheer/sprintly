"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldAlert, Users, Copy, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin/users", label: "All users", icon: Users },
  { href: "/admin/duplicate-ips", label: "Duplicate IPs", icon: Copy },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 flex-col border-r border-border p-4">
      <div className="mb-6 flex items-center gap-2 px-2 font-heading text-lg font-bold tracking-tight">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-danger text-white">
          <ShieldAlert className="h-4 w-4" />
        </span>
        Admin
      </div>

      <nav className="flex-1 space-y-1">
        {LINKS.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active ? "bg-primary/10 text-primary" : "text-muted hover:bg-secondary hover:text-foreground",
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <Link
        href="/dashboard"
        className="mt-6 flex items-center gap-2 border-t border-border pt-4 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to app
      </Link>
    </aside>
  );
}
