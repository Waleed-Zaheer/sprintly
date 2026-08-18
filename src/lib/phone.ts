import { PhoneNumberUtil, PhoneNumberFormat } from "google-libphonenumber";

const util = PhoneNumberUtil.getInstance();

export function isValidPhone(raw: string, defaultRegion = "US") {
  try {
    const parsed = util.parse(raw, defaultRegion);
    return util.isValidNumber(parsed);
  } catch {
    return false;
  }
}

export function formatPhoneE164(raw: string, defaultRegion = "US") {
  const parsed = util.parse(raw, defaultRegion);
  return util.format(parsed, PhoneNumberFormat.E164);
}
