const COOKIE_NAME = "token";
const TOKEN_TTL_SECONDS = 60 * 60 * 24; // 24h

export function setAuthCookie(token: string) {
  const secure = process.env.NODE_ENV === "production" ? "; secure" : "";
  document.cookie = `${COOKIE_NAME}=${token}; path=/; max-age=${TOKEN_TTL_SECONDS}; samesite=lax${secure}`;
}

export function clearAuthCookie() {
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; samesite=lax`;
}

export function getAuthCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)token=([^;]+)/);
  return match?.[1] || null;
}
