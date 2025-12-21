import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify, type JWTPayload, type JWTVerifyOptions } from "jose";
import createIntlMiddleware from "next-intl/middleware";

// ---- i18n 설정 ----
const LOCALES = ["ko", "en", "ja", "zh", "vi"] as const;
type AppLocale = (typeof LOCALES)[number];
const DEFAULT_LOCALE: AppLocale = "en"; // 💡 [유지] 기본 로케일은 'en'
const LOCALE_SET = new Set<string>(LOCALES as unknown as string[]);

const intlMiddleware = createIntlMiddleware({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: "always",
  // 💡 [수정] localeDetection을 true(기본값)로 해야 쿠키(NEXT_LOCALE)를 감지하여 언어를 유지합니다.
  // false로 설정하면 쿠키를 무시하고 무조건 DEFAULT_LOCALE로 리다이렉트됩니다.
  localeDetection: true,
});

// ---- 인증/접근 제어 설정 ----
const COOKIE = process.env.JWT_COOKIE_NAME || "globx_bot";
const LOGIN_PATH = "/auth/login";
const MAX_NEXT_LEN = 2048;

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("JWT_SECRET 환경변수가 없거나 너무 짧습니다(>=16).");
  }
  return new TextEncoder().encode(secret);
}

const VERIFY_OPTS: JWTVerifyOptions = {
  algorithms: ["HS256"],
  ...(process.env.JWT_ISSUER ? { issuer: process.env.JWT_ISSUER } : {}),
  ...(process.env.JWT_AUDIENCE ? { audience: process.env.JWT_AUDIENCE } : {}),
};

// 로케일 prefix를 제거한 경로를 기준으로 공개 여부 판단
const PUBLIC_PATHS: RegExp[] = [
  /^\/$/,
  /^\/home(?:\/.*)?$/,
  /^\/account(?:\/.*)?$/,
  /^\/announcements(?:\/.*)?$/,
  /^\/events(?:\/.*)?$/,
  /^\/help(?:\/.*)?$/,
  /^\/cases(?:\/.*)?$/,
  /^\/bot-config(?:\/.*)?$/,
  /^\/bot-list(?:\/.*)?$/,

  /^\/auth\/login(?:\/.*)?$/,
  /^\/auth\/signup(?:\/.*)?$/,
  /^\/history(?:\/.*)?$/,
  /^\/my-config(?:\/.*)?$/,
  /^\/strategy-config(?:\/.*)?$/,

  /^\/api\/theme(?:\/.*)?$/,
  /^\/api\/account(?:\/.*)?$/,
  /^\/api\/announcements(?:\/.*)?$/,
  /^\/api\/events(?:\/.*)?$/,
  /^\/api\/help(?:\/.*)?$/,
  /^\/api\/cases(?:\/.*)?$/,
  /^\/api\/bot-config(?:\/.*)?$/,
  /^\/api\/bot-list(?:\/.*)?$/,

  /^\/api\/auth\/login(?:\/.*)?$/,
  /^\/api\/auth\/logout(?:\/.*)?$/,
  /^\/api\/auth\/signup(?:\/.*)?$/,
  /^\/api\/auth\/me(?:\/.*)?$/,
  /^\/api\/auth\/resolve-user(?:\/.*)?$/,

  /^\/api\/history(?:\/.*)?$/,
  /^\/api\/my-config(?:\/.*)?$/,
  /^\/api\/strategy-config(?:\/.*)?$/,
];

function isLocaleSegment(seg: string): seg is AppLocale {
  return LOCALE_SET.has(seg);
}

function stripLocalePrefix(pathname: string): {
  locale: AppLocale;
  nakedPath: string;
} {
  const parts = pathname.split("/");
  const first = parts[1] ?? "";
  if (isLocaleSegment(first)) {
    const naked = "/" + parts.slice(2).join("/");
    return {
      locale: first as AppLocale,
      nakedPath: naked === "//" ? "/" : naked,
    };
  }
  return { locale: DEFAULT_LOCALE, nakedPath: pathname };
}

function isPublic(pathname: string): boolean {
  const { nakedPath } = stripLocalePrefix(pathname);
  return PUBLIC_PATHS.some((re) => re.test(nakedPath));
}

interface AuthPayload extends JWTPayload {
  userId?: string;
  email?: string;
  level?: number | string;
}

function extractLevelString(payload: AuthPayload): string {
  const v = payload.level;
  const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : 0;
  return Number.isFinite(n) ? String(n) : "0";
}

function withRequestHeaders(
  req: NextRequest,
  extra: Record<string, string>
): NextResponse {
  const requestHeaders = new Headers(req.headers);
  for (const [k, v] of Object.entries(extra)) {
    requestHeaders.set(k, v);
  }
  return NextResponse.next({ request: { headers: requestHeaders } });
}

function setUserHeaders(req: NextRequest, payload: AuthPayload): NextResponse {
  const userId =
    (typeof payload.userId === "string" && payload.userId) ||
    (typeof payload.sub === "string" && payload.sub) ||
    "";
  const { locale } = stripLocalePrefix(req.nextUrl.pathname);

  if (!userId) {
    const res = withRequestHeaders(req, { "x-next-intl-locale": locale });
    if (process.env.NODE_ENV !== "production") {
      res.headers.set("x-debug-user-level", "0");
      res.headers.set("x-debug-locale", locale);
    }
    return res;
  }

  const email = typeof payload.email === "string" ? payload.email : "";
  const levelStr = extractLevelString(payload);

  const extra: Record<string, string> = {
    "x-user-id": userId,
    "x-user-level": levelStr,
    "x-next-intl-locale": locale,
  };
  if (email) extra["x-user-email"] = email;
  if (typeof payload.jti === "string") extra["x-session-jti"] = payload.jti;

  const res = withRequestHeaders(req, extra);
  if (process.env.NODE_ENV !== "production") {
    res.headers.set("x-debug-user-level", levelStr);
    res.headers.set("x-debug-locale", locale);
  }
  return res;
}

async function attachUserIfValid(req: NextRequest): Promise<NextResponse> {
  const token = req.cookies.get(COOKIE)?.value;
  const { locale } = stripLocalePrefix(req.nextUrl.pathname);

  if (!token) {
    const res = withRequestHeaders(req, { "x-next-intl-locale": locale });
    if (process.env.NODE_ENV !== "production") {
      res.headers.set("x-debug-locale", locale);
    }
    return res;
  }
  try {
    const { payload } = await jwtVerify(token, getSecret(), VERIFY_OPTS);
    return setUserHeaders(req, payload as AuthPayload);
  } catch {
    const res = withRequestHeaders(req, { "x-next-intl-locale": locale });
    if (process.env.NODE_ENV !== "production") {
      res.headers.set("x-debug-locale", locale);
    }
    return res;
  }
}

// 로그인 성공 후 next 파라미터 처리 유틸
function getNextParam(req: NextRequest, fallback: string = "/"): string {
  try {
    const u = new URL(req.url);
    const next = u.searchParams.get("next");
    if (!next) return fallback;
    if (!next.startsWith("/") || next.startsWith("//")) return fallback;
    if (next.length > MAX_NEXT_LEN) return fallback;
    return next;
  } catch {
    return fallback;
  }
}

function withLocalePrefix(path: string, locale: string): string {
  const parts = path.split("/");
  const first = parts[1] ?? "";
  const isLoc = LOCALE_SET.has(first);
  return isLoc ? path : `/${locale}${path === "/" ? "" : path}`;
}

function redirectOr401(req: NextRequest): NextResponse {
  const isApi = req.nextUrl.pathname.startsWith("/api/");
  if (isApi) {
    return NextResponse.json(
      { ok: false, code: "UNAUTHORIZED" },
      { status: 401 }
    );
  }

  let nextTarget = req.nextUrl.pathname + req.nextUrl.search;
  if (nextTarget.startsWith(LOGIN_PATH)) nextTarget = "/";
  try {
    const u = new URL(req.url);
    const existing = u.searchParams.get("next");
    if (existing) nextTarget = existing.startsWith(LOGIN_PATH) ? "/" : existing;
  } catch {
    /* noop */
  }
  if (nextTarget.length > MAX_NEXT_LEN) nextTarget = "/";

  const login = new URL(LOGIN_PATH, req.url);
  login.searchParams.set("next", nextTarget);
  return NextResponse.redirect(login);
}

export async function middleware(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl;

  // (A) 로케일 프리픽스가 붙은 API를 `/api/**`로 rewrite
  const localeGroup = (LOCALES as readonly string[]).join("|");
  const apiLocaleMatch = pathname.match(
    new RegExp(`^\\/(${localeGroup})\\/api\\/(.+)$`)
  );
  if (apiLocaleMatch) {
    const target = `/api/${apiLocaleMatch[2]}`;
    return NextResponse.rewrite(new URL(target, req.url));
  }

  // (B) API 경로는 i18n 미들웨어 건너뛰고 인증만 처리
  if (pathname.startsWith("/api/")) {
    if (isPublic(pathname)) {
      return attachUserIfValid(req);
    }
    const token = req.cookies.get(COOKIE)?.value;
    if (!token) return redirectOr401(req);
    try {
      const { payload } = await jwtVerify(token, getSecret(), VERIFY_OPTS);
      return setUserHeaders(req, payload as AuthPayload);
    } catch {
      return redirectOr401(req);
    }
  }

  // (C) 페이지 라우트: 먼저 i18n 미들웨어(로케일 협상/리다이렉트)
  const intlRes = intlMiddleware(req);
  const hasRedirect = intlRes.headers.has("location");
  const hasRewrite = intlRes.headers.has("x-middleware-rewrite");
  if (hasRedirect || hasRewrite) {
    return intlRes;
  }

  const { nakedPath, locale } = stripLocalePrefix(pathname);

  // (D) 로그인 경로: 유효 토큰이면 next로 즉시 리다이렉트(로케일 보존)
  if (nakedPath.startsWith(LOGIN_PATH)) {
    const token = req.cookies.get(COOKIE)?.value;
    if (!token) return attachUserIfValid(req);

    try {
      const { payload } = await jwtVerify(token, getSecret(), VERIFY_OPTS);
      const nextTarget = getNextParam(req, "/");
      const localized = withLocalePrefix(nextTarget, locale);
      const res = NextResponse.redirect(new URL(localized, req.url));
      if (process.env.NODE_ENV !== "production") {
        res.headers.set(
          "x-debug-user-level",
          extractLevelString(payload as AuthPayload)
        );
        res.headers.set("x-debug-locale", locale);
      }
      return res;
    } catch {
      return attachUserIfValid(req);
    }
  }

  // (E) 공개 페이지 → 소프트 인증 (비로그인 접근 가능)
  if (isPublic(pathname)) {
    return attachUserIfValid(req);
  }

  // (F) 보호 페이지 → 강제 인증 (토큰 없으면 로그인 이동)
  const token = req.cookies.get(COOKIE)?.value;
  if (!token) return redirectOr401(req);
  try {
    const { payload } = await jwtVerify(token, getSecret(), VERIFY_OPTS);
    return setUserHeaders(req, payload as AuthPayload);
  } catch {
    return redirectOr401(req);
  }
}

// ✅ 공식 권장 매처: API 및 정적 자산/확장자 제외 (API 포함)
export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
