"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/sonner";

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

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [error, setError] = useState<string | null>(null);
  const [showRecoveryLink, setShowRecoveryLink] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setShowRecoveryLink(false);

    if (form.password !== form.confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: form.password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Couldn't reset your password.");
        setShowRecoveryLink(true);
        return;
      }

      toast.success("Password updated — log in with your new password.");
      router.push("/login");
    } finally {
      setLoading(false);
    }
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
        <h1 className="font-heading text-xl font-semibold">Set a new password</h1>
        <p className="mt-1 text-sm text-muted">Choose a new password for your Sprintly account.</p>
      </div>

      <LabeledInput
        id="password"
        label="New password"
        type="password"
        required
        minLength={8}
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />
      <LabeledInput
        id="confirmPassword"
        label="Confirm password"
        type="password"
        required
        minLength={8}
        value={form.confirmPassword}
        onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
      />

      {error && (
        <p className="text-sm text-danger">
          {error}
          {showRecoveryLink && (
            <>
              {" "}
              <Link href="/forgot-password" className="font-medium text-primary hover:text-primary-hover">
                Request a new reset link
              </Link>
            </>
          )}
        </p>
      )}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Updating…" : "Update password"}
      </Button>
    </motion.form>
  );
}
