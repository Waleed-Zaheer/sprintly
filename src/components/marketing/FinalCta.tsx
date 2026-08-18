"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FinalCta() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-4xl bg-foreground px-8 py-16 text-center sm:px-16"
      >
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-10 invert" />
        <div className="hero-glow pointer-events-none absolute left-1/2 top-0 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/3 rounded-full" />

        <h2 className="relative font-heading text-3xl font-semibold tracking-tight text-background sm:text-4xl">
          Plan your next sprint today
        </h2>
        <p className="relative mx-auto mt-3 max-w-md text-background/70">
          Free for a day, no card required. Upgrade whenever you're ready.
        </p>
        <div className="relative mt-8 flex justify-center">
          <Button
            size="lg"
            nativeButton={false}
            render={
              <Link href="/register">
                Start free for a day
                <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />
        </div>
      </motion.div>
    </section>
  );
}
