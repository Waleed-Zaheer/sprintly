import Link from "next/link";
import { Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ProductMockup } from "@/components/marketing/ProductMockup";
import { Logo } from "@/components/Logo";

const HIGHLIGHTS = ["Unlimited sprints and tasks", "One-click time tracking", "Free for a day, no card required"];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1">
      <div className="flex w-full flex-col items-center justify-center px-6 py-16 lg:w-[42%] lg:px-12 xl:px-16">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-8">
            <Logo />
          </Link>
          <Card className="p-8">{children}</Card>
        </div>
      </div>

      <div className="relative hidden flex-1 items-center justify-center overflow-hidden bg-foreground p-16 lg:flex">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-10 invert" />
        <div className="hero-glow pointer-events-none absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 rounded-full" />

        <div className="relative w-full max-w-lg">
          <h2 className="font-heading text-3xl font-semibold leading-tight tracking-tight text-background">
            Plan the sprint. <span className="text-accent">Track the hours.</span> Ship on time.
          </h2>
          <ul className="mt-6 space-y-3">
            {HIGHLIGHTS.map((item) => (
              <li key={item} className="flex items-center gap-2.5 text-sm text-background/80">
                <Check className="h-4 w-4 shrink-0 text-accent" />
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-10">
            <ProductMockup />
          </div>
        </div>
      </div>
    </div>
  );
}
