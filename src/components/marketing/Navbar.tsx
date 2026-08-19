"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserMenu } from "@/components/UserMenu";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";

export function Navbar() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const user = useAuthStore((state) => state.user);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/">
          <Logo />
        </Link>

        <div className="hidden items-center gap-8 text-sm font-medium text-muted sm:flex">
          <Link href="#features" className="transition-colors hover:text-foreground">
            {t("nav.features")}
          </Link>
          <Link href="#pricing" className="transition-colors hover:text-foreground">
            {t("nav.pricing")}
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <ThemeToggle />
          {user ? (
            <UserMenu />
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:inline-flex"
                nativeButton={false}
                render={<Link href="/login">{t("nav.login")}</Link>}
              />
              <Button size="sm" nativeButton={false} render={<Link href="/register">{t("nav.getStarted")}</Link>} />
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((prev) => !prev)}
          >
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden border-t border-border sm:hidden"
          >
            <div className="flex flex-col px-6 py-2 text-sm font-medium text-muted">
              <Link
                href="#features"
                onClick={() => setOpen(false)}
                className="py-3 transition-colors hover:text-foreground"
              >
                {t("nav.features")}
              </Link>
              <Link
                href="#pricing"
                onClick={() => setOpen(false)}
                className="py-3 transition-colors hover:text-foreground"
              >
                {t("nav.pricing")}
              </Link>
              <Link
                href={user ? "/dashboard" : "/login"}
                onClick={() => setOpen(false)}
                className="py-3 transition-colors hover:text-foreground"
              >
                {user ? "Dashboard" : t("nav.login")}
              </Link>
              <div className="flex items-center justify-between py-3">
                <span>Theme</span>
                <ThemeToggle />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
