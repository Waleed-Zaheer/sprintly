import Link from "next/link";
import { Compass, Zap } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <Link href="/" className="mb-8 flex items-center gap-2 font-heading text-lg font-bold tracking-tight">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Zap className="h-4 w-4" fill="currentColor" strokeWidth={0} />
        </span>
        Sprint<span className="gradient-text">ly</span>
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
