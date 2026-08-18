"use client";

import { useEffect, type ReactNode } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "@/i18n/config";

export function I18nProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.documentElement.lang = i18n.language.split("-")[0];
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
