"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, UserPlus, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/sonner";

type Member = { id: string; name: string; email: string; role: string };
type Invitation = { id: string; email: string; status: string };

const ROLE_BADGE: Record<string, { variant: "default" | "secondary" | "outline"; className?: string }> = {
  owner: { variant: "default" },
  admin: { variant: "outline", className: "border-accent/30 bg-accent/10 text-accent" },
  member: { variant: "secondary" },
};

export function TeamPanel() {
  const [members, setMembers] = useState<Member[]>([]);
  const [pending, setPending] = useState<Invitation[]>([]);
  const [seatLimit, setSeatLimit] = useState(0);
  const [seatsUsed, setSeatsUsed] = useState(0);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [inviting, setInviting] = useState(false);
  const [notInCompany, setNotInCompany] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch("/api/company/invite");
    if (res.status === 403) {
      setNotInCompany(true);
      return;
    }
    try {
      const data = await res.json();
      setMembers(data.members ?? []);
      setPending(data.pending ?? []);
      setSeatLimit(data.seatLimit ?? 0);
      setSeatsUsed(data.seatsUsed ?? 0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInviting(true);
    try {
      const res = await fetch("/api/company/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Couldn't send that invite.");
        return;
      }
      const invitedEmail = email;
      setEmail("");
      await load();
      toast.success("Invite sent", { description: `We'll notify ${invitedEmail} once they join.` });
    } finally {
      setInviting(false);
    }
  }

  if (notInCompany) {
    return (
      <Card>
        <CardContent className="text-sm text-muted">
          Team management is available on the Enterprise plan. Upgrade from{" "}
          <a href="/dashboard/settings/billing" className="font-medium text-primary hover:text-primary-hover">
            Billing
          </a>{" "}
          to invite up to 50 teammates.
        </CardContent>
      </Card>
    );
  }

  const pct = seatLimit > 0 ? Math.min(100, Math.round((seatsUsed / seatLimit) * 100)) : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-2 w-full" />
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 text-sm font-medium text-muted">
                <Users className="h-4 w-4" />
                Team seats
              </div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="font-medium">Seats used</span>
                <span className="text-muted">
                  {seatsUsed} / {seatLimit}
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-border">
                <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-9 w-full" />
            </div>
          ) : (
            <form onSubmit={handleInvite} className="flex items-end gap-3">
              <div className="flex-1">
                <Label htmlFor="invite-email" className="mb-1.5">
                  Invite by email
                </Label>
                <Input
                  id="invite-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="teammate@company.com"
                />
              </div>
              <Button type="submit" disabled={inviting}>
                <UserPlus className="h-3.5 w-3.5" />
                {inviting ? "Sending…" : "Invite"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
      {error && <p className="text-sm text-danger">{error}</p>}

      <Card>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ) : (
            <>
              <h3 className="text-sm font-semibold text-muted">Members</h3>
              <ul className="mt-3 space-y-2">
                {members.map((m, i) => (
                  <motion.li
                    key={m.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, delay: i * 0.04 }}
                    className="flex items-center justify-between text-sm"
                  >
                    <span>
                      {m.name} <span className="text-muted">— {m.email}</span>
                    </span>
                    <Badge {...(ROLE_BADGE[m.role] ?? ROLE_BADGE.member)}>{m.role}</Badge>
                  </motion.li>
                ))}
              </ul>

              {pending.length > 0 && (
                <>
                  <h3 className="mt-5 text-sm font-semibold text-muted">Pending invites</h3>
                  <ul className="mt-3 space-y-2">
                    {pending.map((p) => (
                      <li key={p.id} className="flex items-center gap-2 text-sm text-muted">
                        <Clock className="h-3.5 w-3.5 text-muted" />
                        <span className="flex-1">{p.email}</span>
                        <Badge variant="outline" className="border-warning/30 bg-warning/10 text-warning">
                          pending
                        </Badge>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
