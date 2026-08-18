import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono, Bricolage_Grotesque } from "next/font/google";
import { Toaster } from "@/components/sonner";
import { I18nProvider } from "@/components/I18nProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { TopLoader } from "@/components/TopLoader";
import { CookieConsent } from "@/components/CookieConsent";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sprintly — Time & Sprint Tracker",
  description: "Sprint planning and time tracking for individuals and companies, with real-time push notifications.",
  manifest: "/manifest.json",
  icons: { icon: "/favicon-32.png", apple: "/icon-192.png" },
};

export const viewport: Viewport = {
  themeColor: "#6d5efc",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${bricolage.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <Suspense fallback={null}>
            <TopLoader />
          </Suspense>
          <I18nProvider>{children}</I18nProvider>
          <Toaster position="bottom-right" closeButton />
          <CookieConsent />
        </ThemeProvider>
      </body>
    </html>
  );
}
