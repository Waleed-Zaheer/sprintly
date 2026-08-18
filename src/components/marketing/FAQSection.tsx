"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    q: "Do I need a credit card to start?",
    a: "No. The Free plan and the Individual plan's 7-day trial don't ask for a card upfront. Enterprise has no trial, so payment is set up at signup.",
  },
  {
    q: "Can I switch plans later?",
    a: "Yes — upgrade or change plans anytime from Dashboard → Billing. Stripe handles proration automatically.",
  },
  {
    q: "How does the 50-seat limit work on Enterprise?",
    a: "The account owner invites teammates from Dashboard → Team. Once 50 members (including pending invites) are reached, further invites are blocked until a seat frees up.",
  },
  {
    q: "What happens when my trial ends?",
    a: "You'll get a reminder before it expires, and can upgrade anytime from Billing — no surprise charges.",
  },
  {
    q: "What data do you collect, and why?",
    a: "Just what the product needs, plus your sign-up IP and coarse location — used only to catch multi-accounting abuse of free trials, never for tracking or ads. Full details in our Privacy Policy.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="mx-auto max-w-3xl px-6 py-24">
      <div className="text-center">
        <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">Questions, answered</h2>
        <p className="mt-3 text-muted">Can't find what you're looking for? Reach out at hello@sprintly.app.</p>
      </div>

      <div className="mt-12 divide-y divide-border border-t border-b border-border">
        {FAQS.map((faq, i) => {
          const open = openIndex === i;
          return (
            <div key={faq.q}>
              <button
                type="button"
                onClick={() => setOpenIndex(open ? null : i)}
                aria-expanded={open}
                className="flex w-full items-center justify-between gap-4 py-5 text-left"
              >
                <span className="font-heading font-medium">{faq.q}</span>
                <Plus className={cn("h-4 w-4 shrink-0 text-muted transition-transform duration-200", open && "rotate-45")} />
              </button>
              <AnimatePresence initial={false}>
                {open && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <p className="pb-5 text-sm text-muted">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
