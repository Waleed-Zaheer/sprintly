import { requireUser } from "./require";

/**
 * Platform-admin authorization is intentionally never cached in the JWT —
 * every call re-checks isPlatformAdmin (and, via requireUser, accountStatus)
 * fresh from the DB, so revoking admin access or disabling an admin's own
 * account takes effect immediately rather than waiting out a ~30-day session.
 */
export async function requirePlatformAdmin() {
  const user = await requireUser();
  if (!user || !user.isPlatformAdmin) return null;
  return user;
}
