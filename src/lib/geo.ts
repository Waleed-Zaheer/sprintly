const PRIVATE_IP_PATTERNS = [
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[0-1])\./,
  /^::1$/,
  /^fc00:/,
  /^fe80:/,
];

/**
 * Best-effort client IP extraction. Vercel (and most reverse proxies) set
 * x-forwarded-for to "client, proxy1, proxy2, ..." — the first entry is the
 * original client. Falls back to x-real-ip. Returns null (not "unknown")
 * when nothing usable is present, e.g. local dev without a proxy in front.
 */
export function getClientIp(request: Request): string | null {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get("x-real-ip");
  return realIp?.trim() || null;
}

function isPrivateOrLoopback(ip: string) {
  return PRIVATE_IP_PATTERNS.some((pattern) => pattern.test(ip));
}

export type GeoLocation = {
  country: string | null;
  region: string | null;
  city: string | null;
};

/**
 * Best-effort IP geolocation via ipapi.co's free tier (no API key, ~1k
 * req/day). Never throws — returns nulls on any failure (network error,
 * rate limit, timeout, private/loopback IP) so callers can always proceed
 * without this blocking a critical path like registration.
 */
export async function lookupGeo(ip: string): Promise<GeoLocation> {
  const empty: GeoLocation = { country: null, region: null, city: null };
  if (!ip || isPrivateOrLoopback(ip)) return empty;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2000);

  try {
    const res = await fetch(`https://ipapi.co/${encodeURIComponent(ip)}/json/`, {
      signal: controller.signal,
      headers: { "User-Agent": "sprintly-app" },
    });
    if (!res.ok) return empty;

    const data = await res.json();
    if (data?.error) return empty;

    return {
      country: data.country_name ?? null,
      region: data.region ?? null,
      city: data.city ?? null,
    };
  } catch {
    return empty;
  } finally {
    clearTimeout(timeout);
  }
}

export function formatLocation(loc: { country: string | null; region: string | null; city: string | null }) {
  return [loc.city, loc.region, loc.country].filter(Boolean).join(", ") || null;
}
