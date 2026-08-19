import Link from "next/link";
import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { InviteAcceptForm } from "@/components/auth/InviteAcceptForm";
import { Logo } from "@/components/Logo";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function InviteAcceptPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <Link href="/" className="mb-8">
        <Logo />
      </Link>
      <Card className="w-full max-w-md p-8">
        <InviteAcceptForm token={token} />
      </Card>
    </div>
  );
}
