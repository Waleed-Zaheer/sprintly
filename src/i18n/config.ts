"use client";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "./locales/en/common.json";
import es from "./locales/es/common.json";
import fr from "./locales/fr/common.json";
import de from "./locales/de/common.json";
import pt from "./locales/pt/common.json";
import zh from "./locales/zh/common.json";
import { DEFAULT_LANGUAGE } from "./languages";

const RESOURCES = {
  en: { common: en },
  es: { common: es },
  fr: { common: fr },
  de: { common: de },
  pt: { common: pt },
  zh: { common: zh },
};

function baseOptions(initialLang: string) {
  return {
    resources: RESOURCES,
    lng: initialLang,
    fallbackLng: "en",
    defaultNS: "common",
    interpolation: { escapeValue: false },
  };
}

// `lng` is passed explicitly (resolved server-side from the `i18nextLng` cookie, see
// I18nProvider) so the very first client render matches what the server already sent.
// If `lng` were omitted, i18next-browser-languagedetector would resolve the language
// itself on the client from localStorage/navigator — a value the server can't know
// ahead of time — causing a hydration mismatch on every non-default-language visit.
export function initI18n(initialLang: string = DEFAULT_LANGUAGE) {
  if (typeof window === "undefined") {
    // A Node server process handles many requests concurrently, potentially for
    // different users/languages. i18next's default export is a module-level
    // singleton shared by the whole process — reusing it here means whichever
    // request initializes it first "wins" for every later request, regardless of
    // that request's own cookie. Give each server render its own isolated instance.
    const serverI18n = i18n.createInstance();
    serverI18n.use(initReactI18next).init(baseOptions(initialLang));
    return serverI18n;
  }

  // Browser: one tab, one user — a persistent singleton is safe here, and it's
  // what lets changeLanguage() (from the language switcher) stick across re-renders.
  if (!i18n.isInitialized) {
    i18n
      .use(LanguageDetector)
      .use(initReactI18next)
      .init({
        ...baseOptions(initialLang),
        detection: {
          order: ["cookie", "localStorage", "navigator"],
          caches: ["cookie", "localStorage"],
          lookupCookie: "i18nextLng",
        },
      });
  }

  return i18n;
}

export default i18n;
