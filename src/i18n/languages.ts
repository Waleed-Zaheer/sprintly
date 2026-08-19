export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "pt", label: "Português" },
  { code: "zh", label: "中文" },
] as const;

export type SupportedLanguageCode = (typeof SUPPORTED_LANGUAGES)[number]["code"];

const CODES: readonly string[] = SUPPORTED_LANGUAGES.map((lang) => lang.code);

export function isSupportedLanguage(code: string | undefined | null): code is SupportedLanguageCode {
  return !!code && CODES.includes(code);
}

export const DEFAULT_LANGUAGE: SupportedLanguageCode = "en";
