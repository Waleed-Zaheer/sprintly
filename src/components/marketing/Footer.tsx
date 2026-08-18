import Link from "next/link";
import { Zap } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-muted sm:flex-row">
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <Link href="/" className="flex items-center gap-2 font-heading text-sm font-bold tracking-tight text-foreground">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Zap className="h-4 w-4" fill="currentColor" strokeWidth={0} />
            </span>
            Sprint<span className="gradient-text">ly</span>
          </Link>
          <p>© {new Date().getFullYear()} Sprintly. All rights reserved.</p>
        </div>
        <div className="flex gap-6">
          <Link href="#pricing" className="text-sm text-muted transition-colors hover:text-foreground">
            Pricing
          </Link>
          <Link href="/privacy" className="text-sm text-muted transition-colors hover:text-foreground">
            Privacy
          </Link>
          <Link href="/terms" className="text-sm text-muted transition-colors hover:text-foreground">
            Terms
          </Link>
          <Link href="/login" className="text-sm text-muted transition-colors hover:text-foreground">
            Log in
          </Link>
        </div>
      </div>
      <div className="border-t border-border px-6 py-4 text-center text-xs text-muted">
        Designed and developed by{" "}
        <a
          href="https://www.linkedin.com/in/waleed-zaheer-x073/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-foreground transition-colors hover:text-primary"
        >
          Waleed Zaheer
        </a>
      </div>
    </footer>
  );
}
