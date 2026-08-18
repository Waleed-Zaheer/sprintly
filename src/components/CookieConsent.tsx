"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Cookie } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "sprintly-cookie-consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  function accept() {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setVisible(false);
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-lg sm:inset-x-auto sm:right-6"
        >
          <Card>
            <CardContent>
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Cookie className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Cookies</p>
                  <p className="mt-1 text-sm text-muted">
                    We use a single strictly-necessary cookie to keep you logged in — no tracking or ads. See our{" "}
                    <Link href="/privacy" className="text-primary hover:text-primary-hover">
                      Privacy Policy
                    </Link>
                    .
                  </p>
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <Button size="sm" onClick={accept}>
                  Got it
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
