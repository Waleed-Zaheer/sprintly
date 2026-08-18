"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { KeyRound } from "lucide-react";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export function ResetPasswordClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  if (!token) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <KeyRound />
          </EmptyMedia>
          <EmptyTitle>Invalid reset link</EmptyTitle>
          <EmptyDescription>
            Request a new one from the{" "}
            <Link href="/forgot-password">forgot-password page</Link>.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return <ResetPasswordForm token={token} />;
}
