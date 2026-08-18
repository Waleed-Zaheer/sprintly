"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ArrowRight, Sparkles } from "lucide-react";
import { HeroSceneLoader } from "@/components/HeroSceneLoader";
import { ProductMockup } from "@/components/marketing/ProductMockup";
import { Button } from "@/components/ui/button";

export function Hero() {
  const { t } = useTranslation();

  return (
    <section className="relative overflow-hidden">
      <div className="bg-grid pointer-events-none absolute inset-0 h-[600px]" />
      <div className="hero-glow pointer-events-none absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/3 rounded-full" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-6 py-16 sm:py-24 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            Free for a day, no card required
          </span>

          <h1 className="mt-5 font-heading text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
            {t("hero.titlePrefix")} <span className="text-highlight">{t("hero.titleHighlight")}</span>
          </h1>
          <p className="mt-5 max-w-lg text-lg text-muted">{t("hero.subtitle")}</p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Button
              size="lg"
              nativeButton={false}
              render={
                <Link href="/register">
                  {t("hero.cta")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              }
            />
            <Button
              variant="outline"
              size="lg"
              nativeButton={false}
              render={<Link href="#pricing">{t("hero.ctaSecondary")}</Link>}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="relative"
        >
          <div className="pointer-events-none absolute -inset-24 blur-[2px]">
            <HeroSceneLoader />
          </div>
          <div className="relative">
            <ProductMockup />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
