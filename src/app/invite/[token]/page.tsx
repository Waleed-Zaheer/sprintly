import Link from "next/link";
import { Card } from "@/components/ui/card";
import { InviteAcceptForm } from "@/components/auth/InviteAcceptForm";

export default async function InviteAcceptPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <Link href="/" className="mb-8 font-heading text-lg font-bold tracking-tight">
        Sprint<span className="gradient-text">ly</span>
      </Link>
      <Card className="w-full max-w-md p-8">
        <InviteAcceptForm token={token} />
      </Card>
    </div>
  );
}
