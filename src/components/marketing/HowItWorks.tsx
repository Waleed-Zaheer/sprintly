"use client";

import { motion } from "framer-motion";
import { Rocket, Timer, CheckCircle2, type LucideIcon } from "lucide-react";

const STEPS: { title: string; body: string; icon: LucideIcon }[] = [
  {
    title: "Start a sprint",
    body: "Set a goal and a deadline — solo, or with your whole team.",
    icon: Rocket,
  },
  {
    title: "Track every minute",
    body: "One-click timer against any task. No spreadsheets, no guesswork.",
    icon: Timer,
  },
  {
    title: "Ship, then repeat",
    body: "Close the sprint, see exactly where the time went, and plan the next one.",
    icon: CheckCircle2,
  },
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">From idea to shipped, in three steps</h2>
        <p className="mt-3 text-muted">No onboarding call required.</p>
      </div>

      <div className="relative mt-16 grid gap-10 sm:grid-cols-3 sm:gap-6">
        <div className="absolute top-6 left-0 right-0 hidden h-px bg-border sm:block" aria-hidden />

        {STEPS.map((step, i) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.45, delay: i * 0.1 }}
            className="relative flex flex-col items-start"
          >
            <div className="relative flex h-12 w-12 items-center justify-center rounded-full border border-border bg-background text-primary">
              <step.icon className="h-5 w-5" />
            </div>
            <span className="mt-4 font-heading text-sm font-semibold text-primary">Step {i + 1}</span>
            <h3 className="mt-1 font-heading text-lg font-semibold">{step.title}</h3>
            <p className="mt-2 text-sm text-muted">{step.body}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
