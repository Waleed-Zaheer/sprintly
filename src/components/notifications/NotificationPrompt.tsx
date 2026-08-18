"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/sonner";
import {
  isNotificationSupported,
  registerPushSubscription,
  requestNotificationPermission,
  showLocalNotification,
} from "@/lib/notifications/client";

export function NotificationPrompt() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isNotificationSupported()) return;
    if (Notification.permission === "default") {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
    if (Notification.permission === "granted") {
      registerPushSubscription().catch(() => {});
    }
  }, []);

  async function handleEnable() {
    const permission = await requestNotificationPermission();
    setVisible(false);
    if (permission === "granted") {
      await registerPushSubscription().catch(() => {});
      showLocalNotification("Notifications enabled", "We'll alert you about sprint deadlines and trial status.");
      toast.success("Notifications enabled", {
        description: "We'll alert you about sprint deadlines and trial status.",
      });
    } else {
      toast.info("No worries — you can enable notifications anytime from your browser's site settings.");
    }
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-6 right-6 z-50 w-80 shadow-xl"
        >
          <Card size="sm">
            <CardContent>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <p className="text-sm font-semibold">Stay on top of your sprints</p>
              </div>
              <p className="mt-1 text-sm text-muted">
                Enable desktop and browser notifications for timer reminders, sprint deadlines, and trial alerts.
              </p>
              <div className="mt-3 flex gap-2">
                <Button onClick={handleEnable} size="sm">
                  Enable
                </Button>
                <Button onClick={() => setVisible(false)} variant="ghost" size="sm">
                  Not now
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
