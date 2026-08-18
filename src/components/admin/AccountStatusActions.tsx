"use client";

import { useState } from "react";
import { Ban, ShieldOff, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/sonner";
import type { AccountStatus } from "@/lib/db/schema";

/**
 * Restrict / disable / reactivate buttons for one user row, shared by both
 * admin tables (/admin/users and /admin/duplicate-ips) so the action set,
 * confirmation, and API call are identical in both places.
 */
export function AccountStatusActions({
  userId,
  status,
  onChanged,
}: {
  userId: string;
  status: AccountStatus;
  onChanged: (next: AccountStatus) => void;
}) {
  const [updating, setUpdating] = useState<AccountStatus | null>(null);

  async function setStatus(next: AccountStatus, confirmMessage?: string) {
    if (confirmMessage && !window.confirm(confirmMessage)) return;
    setUpdating(next);
    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Couldn't update that account.");
        return;
      }
      onChanged(next);
      toast.success(
        next === "active" ? "Account reactivated" : next === "restricted" ? "Account restricted" : "Account disabled",
      );
    } finally {
      setUpdating(null);
    }
  }

  if (status !== "active") {
    return (
      <Button
        size="xs"
        variant="outline"
        disabled={updating !== null}
        onClick={() => setStatus("active")}
      >
        <RotateCcw className="h-3 w-3" />
        Reactivate
      </Button>
    );
  }

  return (
    <div className="flex gap-1.5">
      <Button
        size="xs"
        variant="outline"
        disabled={updating !== null}
        onClick={() => setStatus("restricted", "Restrict this account? They'll be signed out and unable to log back in until reactivated.")}
      >
        <ShieldOff className="h-3 w-3" />
        Restrict
      </Button>
      <Button
        size="xs"
        variant="destructive"
        disabled={updating !== null}
        onClick={() => setStatus("disabled", "Disable this account? They'll be signed out and unable to log back in until reactivated.")}
      >
        <Ban className="h-3 w-3" />
        Disable
      </Button>
    </div>
  );
}
