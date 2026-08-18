"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronRight, Copy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { AccountStatusActions } from "@/components/admin/AccountStatusActions";
import { formatLocation } from "@/lib/geo";
import type { AccountStatus } from "@/lib/db/schema";

type Account = {
  id: string;
  name: string;
  email: string;
  accountStatus: AccountStatus;
  signupIp: string | null;
  signupCountry: string | null;
  signupRegion: string | null;
  signupCity: string | null;
  createdAt: string;
  companyName: string | null;
};

type Group = {
  ip: string;
  count: number;
  country: string | null;
  region: string | null;
  city: string | null;
  accounts: Account[];
};

const STATUS_BADGE: Record<AccountStatus, { variant: "outline" | "destructive"; className?: string }> = {
  active: { variant: "outline", className: "border-success/30 bg-success/10 text-success" },
  restricted: { variant: "outline", className: "border-warning/30 bg-warning/10 text-warning" },
  disabled: { variant: "destructive" },
};

export function DuplicateIpsTable() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedIp, setExpandedIp] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/duplicate-ips");
        const data = await res.json();
        setGroups(data.groups ?? []);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function handleAccountChanged(ip: string, accountId: string, next: AccountStatus) {
    setGroups((prev) =>
      prev.map((group) =>
        group.ip !== ip
          ? group
          : {
              ...group,
              accounts: group.accounts.map((account) =>
                account.id === accountId ? { ...account, accountStatus: next } : account,
              ),
            },
      ),
    );
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <Empty className="border border-dashed border-border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Copy />
          </EmptyMedia>
          <EmptyTitle>No shared IPs found</EmptyTitle>
          <EmptyDescription>Every account signed up from a different IP address.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="space-y-3">
      {groups.map((group) => {
        const expanded = expandedIp === group.ip;
        const location = formatLocation({ country: group.country, region: group.region, city: group.city });

        return (
          <Card key={group.ip} size="sm">
            <CardContent>
              <button
                type="button"
                onClick={() => setExpandedIp(expanded ? null : group.ip)}
                aria-expanded={expanded}
                className="flex w-full items-center justify-between gap-3 text-left"
              >
                <div className="flex items-center gap-3">
                  {expanded ? (
                    <ChevronDown className="h-4 w-4 shrink-0 text-muted" />
                  ) : (
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted" />
                  )}
                  <div>
                    <div className="font-mono text-sm font-medium">{group.ip}</div>
                    <div className="mt-0.5 text-xs text-muted">{location ?? "Unknown location"}</div>
                  </div>
                </div>
                <Badge variant="secondary">
                  {group.count} account{group.count === 1 ? "" : "s"}
                </Badge>
              </button>

              <AnimatePresence>
                {expanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 space-y-3 border-t border-border pt-4">
                      {group.accounts.map((account) => (
                        <div
                          key={account.id}
                          className="flex flex-col gap-2 rounded-2xl bg-border/30 p-3 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="truncate text-sm font-medium">{account.name}</span>
                              <Badge variant={STATUS_BADGE[account.accountStatus].variant} className={STATUS_BADGE[account.accountStatus].className}>
                                {account.accountStatus}
                              </Badge>
                            </div>
                            <div className="mt-0.5 truncate text-xs text-muted">{account.email}</div>
                            <div className="mt-0.5 text-xs text-muted">
                              {account.companyName ?? "—"} · Signed up {format(new Date(account.createdAt), "MMM d, yyyy")}
                            </div>
                          </div>
                          <div className="shrink-0">
                            <AccountStatusActions
                              userId={account.id}
                              status={account.accountStatus}
                              onChanged={(next) => handleAccountChanged(group.ip, account.id, next)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
