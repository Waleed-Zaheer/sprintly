"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { MailX } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";

function LabeledInput({ label, id, ...props }: React.ComponentProps<typeof Input> & { label: string; id: string }) {
  return (
    <div>
      <Label htmlFor={id} className="mb-1.5">
        {label}
      </Label>
      <Input id={id} {...props} />
    </div>
  );
}

type Invite = { email: string; companyName: string };

export function InviteAcceptForm({ token }: { token: string }) {
  const router = useRouter();
  const [invite, setInvite] = useState<Invite | null>(null);
  const [loadingInvite, setLoadingInvite] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [form, setForm] = useState({ name: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(`/api/invitations/${token}`);
        const data = await res.json();
        if (cancelled) return;

        if (!res.ok) {
          setLoadError(typeof data.error === "string" ? data.error : "This invite is invalid or has expired.");
          return;
        }

        setInvite({ email: data.email, companyName: data.companyName });
      } catch {
        if (!cancelled) {
          setLoadError("Couldn't reach Sprintly. Check your connection and try again.");
        }
      } finally {
        if (!cancelled) setLoadingInvite(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch(`/api/invitations/${token}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Couldn't join the team. Try again.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingInvite) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-9 w-full" />
      </div>
    );
  }

  if (loadError || !invite) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <MailX />
          </EmptyMedia>
          <EmptyTitle>This invite is no longer valid</EmptyTitle>
          <EmptyDescription>
            {loadError ?? "This invite link is invalid or has expired."}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button render={<Link href="/register">Create an account instead</Link>} nativeButton={false} />
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      <div>
        <h1 className="font-heading text-xl font-semibold">Join {invite.companyName} on Sprintly</h1>
        <p className="mt-1 text-sm text-muted">{invite.email}</p>
      </div>

      <LabeledInput
        id="name"
        label="Full name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        required
      />
      <LabeledInput
        id="password"
        label="Password"
        type="password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        required
      />

      {error && <p className="text-sm text-danger">{error}</p>}

      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? "Joining..." : "Join team"}
      </Button>
    </motion.form>
  );
}
