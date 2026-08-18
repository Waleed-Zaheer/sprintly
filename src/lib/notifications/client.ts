"use client";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export function isNotificationSupported() {
  return typeof window !== "undefined" && "Notification" in window;
}

export function isPushSupported() {
  return typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window;
}

export async function requestNotificationPermission() {
  if (!isNotificationSupported()) return "unsupported" as const;
  return Notification.requestPermission();
}

export function showLocalNotification(title: string, body: string, url = "/dashboard") {
  if (!isNotificationSupported() || Notification.permission !== "granted") return;
  const notification = new Notification(title, { body, icon: "/icon-192.png" });
  notification.onclick = () => {
    window.focus();
    window.location.href = url;
    notification.close();
  };
}

export async function registerPushSubscription() {
  if (!isPushSupported()) return null;

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!publicKey) {
    console.warn("NEXT_PUBLIC_VAPID_PUBLIC_KEY is not set; push notifications are disabled.");
    return null;
  }

  const registration = await navigator.serviceWorker.register("/sw.js");
  await navigator.serviceWorker.ready;

  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });
  }

  await fetch("/api/notifications/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(subscription.toJSON()),
  });

  return subscription;
}
