"use client";

import { useEffect, type ReactNode } from "react";
import { I18nextProvider } from "react-i18next";
import { initI18n } from "@/i18n/config";

export function I18nProvider({ initialLang, children }: { initialLang: string; children: ReactNode }) {
  const i18n = initI18n(initialLang);

  useEffect(() => {
    document.documentElement.lang = i18n.language.split("-")[0];
  }, [i18n]);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
