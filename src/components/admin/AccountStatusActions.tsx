"use client";

import { useState } from "react";
import { Ban, ShieldOff, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/sonner";
import type { AccountStatus } from "@/lib/db/schema";

const CONFIRM_COPY: Partial<Record<AccountStatus, { title: string; description: string }>> = {
  restricted: {
    title: "Restrict this account?",
    description: "They'll be signed out and unable to log back in until reactivated.",
  },
  disabled: {
    title: "Disable this account?",
    description: "They'll be signed out and unable to log back in until reactivated.",
  },
};

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
  const [pendingConfirm, setPendingConfirm] = useState<AccountStatus | null>(null);

  async function setStatus(next: AccountStatus) {
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

  const confirmCopy = pendingConfirm ? CONFIRM_COPY[pendingConfirm] : undefined;

  return (
    <AlertDialog open={pendingConfirm !== null} onOpenChange={(open) => !open && setPendingConfirm(null)}>
      <div className="flex gap-1.5">
        <AlertDialogTrigger
          render={
            <Button size="xs" variant="outline" disabled={updating !== null} onClick={() => setPendingConfirm("restricted")}>
              <ShieldOff className="h-3 w-3" />
              Restrict
            </Button>
          }
        />
        <AlertDialogTrigger
          render={
            <Button size="xs" variant="destructive" disabled={updating !== null} onClick={() => setPendingConfirm("disabled")}>
              <Ban className="h-3 w-3" />
              Disable
            </Button>
          }
        />
      </div>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>{confirmCopy?.title}</AlertDialogTitle>
          <AlertDialogDescription>{confirmCopy?.description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant={pendingConfirm === "disabled" ? "destructive" : "default"}
            onClick={() => {
              if (pendingConfirm) setStatus(pendingConfirm);
              setPendingConfirm(null);
            }}
          >
            Confirm
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
