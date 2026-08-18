"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { AccountStatusActions } from "@/components/admin/AccountStatusActions";
import { formatLocation } from "@/lib/geo";
import type { AccountStatus } from "@/lib/db/schema";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  accountStatus: AccountStatus;
  signupIp: string | null;
  signupCountry: string | null;
  signupRegion: string | null;
  signupCity: string | null;
  createdAt: string;
  companyName: string | null;
};

const STATUS_BADGE: Record<AccountStatus, { variant: "outline" | "destructive"; className?: string }> = {
  active: { variant: "outline", className: "border-success/30 bg-success/10 text-success" },
  restricted: { variant: "outline", className: "border-warning/30 bg-warning/10 text-warning" },
  disabled: { variant: "destructive" },
};

const LIMIT = 50;

export function AdminUsersTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [ipFilter, setIpFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setOffset(0);
      load(0);
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ipFilter, locationFilter]);

  useEffect(() => {
    load(offset);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offset]);

  async function load(nextOffset: number) {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: String(LIMIT), offset: String(nextOffset) });
      if (ipFilter) params.set("ip", ipFilter);
      if (locationFilter) params.set("location", locationFilter);

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      const data = await res.json();
      setUsers(data.users ?? []);
      setTotal(data.total ?? 0);
    } finally {
      setLoading(false);
    }
  }

  function handleStatusChanged(userId: string, next: AccountStatus) {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, accountStatus: next } : u)));
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="ip-filter" className="mb-1.5">
                Filter by IP
              </Label>
              <Input
                id="ip-filter"
                value={ipFilter}
                onChange={(e) => setIpFilter(e.target.value)}
                placeholder="203.0.113"
              />
            </div>
            <div>
              <Label htmlFor="location-filter" className="mb-1.5">
                Filter by location
              </Label>
              <Input
                id="location-filter"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                placeholder="Berlin, or DE"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-2 p-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : users.length === 0 ? (
            <Empty className="p-12">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Users />
                </EmptyMedia>
                <EmptyTitle>No users found</EmptyTitle>
                <EmptyDescription>Try a different IP or location filter.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Signed up</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => {
                  const location = formatLocation({
                    country: user.signupCountry,
                    region: user.signupRegion,
                    city: user.signupCity,
                  });
                  return (
                    <TableRow key={user.id}>
                      <TableCell>{user.companyName ?? "—"}</TableCell>
                      <TableCell>{user.name}</TableCell>
                      <TableCell className="text-muted">{user.email}</TableCell>
                      <TableCell className="font-mono text-xs">{user.signupIp ?? "—"}</TableCell>
                      <TableCell className="text-muted">{location ?? "—"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={STATUS_BADGE[user.accountStatus].variant}
                          className={STATUS_BADGE[user.accountStatus].className}
                        >
                          {user.accountStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted">{format(new Date(user.createdAt), "MMM d, yyyy")}</TableCell>
                      <TableCell>
                        <AccountStatusActions
                          userId={user.id}
                          status={user.accountStatus}
                          onChanged={(next) => handleStatusChanged(user.id, next)}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {!loading && total > LIMIT && (
        <div className="flex items-center justify-between text-sm text-muted">
          <span>
            {offset + 1}–{Math.min(offset + LIMIT, total)} of {total}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - LIMIT))}>
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={offset + LIMIT >= total}
              onClick={() => setOffset(offset + LIMIT)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
