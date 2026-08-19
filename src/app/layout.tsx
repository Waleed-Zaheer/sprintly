import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { cookies } from "next/headers";
import { Geist, Geist_Mono, Bricolage_Grotesque } from "next/font/google";
import { Toaster } from "@/components/sonner";
import { I18nProvider } from "@/components/I18nProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { TopLoader } from "@/components/TopLoader";
import { CookieConsent } from "@/components/CookieConsent";
import { AuthHydrator } from "@/components/AuthHydrator";
import { DEFAULT_LANGUAGE, isSupportedLanguage } from "@/i18n/languages";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const DEFAULT_TITLE = "Sprintly — Time & Sprint Tracker";
const DEFAULT_DESCRIPTION =
  "Sprint planning and time tracking for individuals and companies, with real-time push notifications.";

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
  metadataBase: new URL(SITE_URL),
  title: { default: DEFAULT_TITLE, template: "%s — Sprintly" },
  description: DEFAULT_DESCRIPTION,
  manifest: "/manifest.json",
  icons: { icon: "/favicon-32.png", apple: "/apple-touch-icon.png" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: "Sprintly",
    url: SITE_URL,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#6d5efc",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const cookieStore = await cookies();
  const cookieLang = cookieStore.get("i18nextLng")?.value;
  const initialLang = isSupportedLanguage(cookieLang) ? cookieLang : DEFAULT_LANGUAGE;

  return (
    <html
      lang={initialLang}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${bricolage.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <Suspense fallback={null}>
            <TopLoader />
          </Suspense>
          <AuthHydrator />
          <I18nProvider initialLang={initialLang}>{children}</I18nProvider>
          <Toaster position="bottom-right" closeButton />
          <CookieConsent />
        </ThemeProvider>
      </body>
    </html>
  );
}
