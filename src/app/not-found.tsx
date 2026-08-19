import Link from "next/link";
import { Compass } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Logo } from "@/components/Logo";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <Link href="/" className="mb-8">
        <Logo />
      </Link>

      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Compass className="h-7 w-7" />
      </div>

      <h1 className="mt-6 font-heading text-3xl font-semibold tracking-tight">Off the sprint board</h1>
      <p className="mt-2 max-w-sm text-muted">
        This page doesn&apos;t exist, or it moved. Let&apos;s get you back on track.
      </p>

      <div className="mt-8 flex gap-3">
        <Link href="/" className={buttonVariants({})}>
          Back home
        </Link>
        <Link href="/dashboard" className={buttonVariants({ variant: "outline" })}>
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}
