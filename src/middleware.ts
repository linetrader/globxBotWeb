// src/middleware.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify, type JWTPayload, type JWTVerifyOptions } from "jose";
import createMiddleware from "next-intl/middleware";
import { routing, LOCALES } from "./i18n/routing"; // 💡 [수정] LOCALES import 추가

// =============================================================================
// [1] 설정 및 상수
// =============================================================================

const COOKIE = process.env.JWT_COOKIE_NAME || "globx_bot"; // .env와 일치시킴
const LOGIN_PATH_RAW = "/auth/login";
const MAX_NEXT_LEN = 2048;

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 16) {
    // 개발 편의상 임시 키 (배포 시 주의)
    return new TextEncoder().encode(
      "dev-secret-key-must-be-long-enough-for-security"
    );
  }
  return new TextEncoder().encode(secret);
}

const VERIFY_OPTS: JWTVerifyOptions = {
  algorithms: ["HS256"],
};

// =============================================================================
// [2] 경로 정의
// =============================================================================

const PUBLIC_PATHS: RegExp[] = [
  /^\/$/,
  /^\/about(?:\/.*)?$/,
  /^\/announcements(?:\/.*)?$/,
  /^\/cases(?:\/.*)?$/,
  /^\/events(?:\/.*)?$/,
  /^\/help(?:\/.*)?$/,
  /^\/auth\/login(?:\/.*)?$/,
  /^\/auth\/signup(?:\/.*)?$/,
  /^\/auth\/find-id(?:\/.*)?$/,
  /^\/auth\/find-password(?:\/.*)?$/,
];

const API_PUBLIC_PATHS: RegExp[] = [
  /^\/api\/auth\/login$/,
  /^\/api\/auth\/logout$/,
  /^\/api\/auth\/signup$/,
  /^\/api\/auth\/resolve-user$/,
  /^\/api\/public\/.*$/,
];

// =============================================================================
// [3] 헬퍼 함수
// =============================================================================

function getPathnameWithoutLocale(pathname: string): string {
  const locales = routing.locales;
  for (const locale of locales) {
    // [핵심 수정] 로직을 분리하여 정확도를 높입니다.

    // Case 1: Locale만 있는 경우 (예: /ko)
    if (pathname === `/${locale}`) {
      return "/";
    }

    // Case 2: Locale 뒤에 경로가 오는 경우 (예: /ko/about, /ko/path/)
    if (pathname.startsWith(`/${locale}/`)) {
      const newPath = pathname.replace(`/${locale}`, "");
      // newPath는 "/about" 형태가 됩니다.
      return newPath;
    }
  }
  return pathname;
}

function isPublicPath(pathname: string) {
  const cleanPath = getPathnameWithoutLocale(pathname);
  return PUBLIC_PATHS.some((re) => re.test(cleanPath));
}

function isApiPublic(pathname: string) {
  return API_PUBLIC_PATHS.some((re) => re.test(pathname));
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

/**
 * 요청 헤더에 사용자 정보를 삽입하는 로직 (API/페이지 공용)
 * @returns 수정된 Headers 객체
 */
function applyUserHeadersToRequest(
  headers: Headers,
  payload: AuthPayload
): Headers {
  const requestHeaders = new Headers(headers);
  const userId = (payload.userId || payload.sub || "") as string;
  const level = extractLevelString(payload);
  const email = (payload.email || "") as string;

  if (userId) {
    requestHeaders.set("x-user-id", userId);
    requestHeaders.set("x-user-level", level);
    requestHeaders.set("x-user-email", email);
  }
  return requestHeaders;
}

// =============================================================================
// [4] 메인 로직 (Middleware)
// =============================================================================

const intlMiddleware = createMiddleware(routing);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ---------------------------------------------------------------------------
  // Case A: API 경로 처리
  // ---------------------------------------------------------------------------
  if (pathname.startsWith("/api/")) {
    return handleApiRequest(req, pathname);
  }

  // ---------------------------------------------------------------------------
  // Case B: 페이지 경로 처리 (next-intl + Auth)
  // ---------------------------------------------------------------------------
  return handlePageRequest(req, pathname);
}

// =============================================================================
// [5] 내부 처리 함수들
// =============================================================================

/** 페이지 요청 처리 핸들러 (수정) */
async function handlePageRequest(
  req: NextRequest,
  pathname: string
): Promise<NextResponse> {
  // 1. next-intl 처리 (locale 리다이렉션 등을 처리)
  const intlResponse = intlMiddleware(req);

  // next-intl이 리다이렉션을 했다면 (예: / -> /ko), 그 응답을 바로 반환합니다.
  if (intlResponse.headers.get("location")) {
    return intlResponse;
  }

  // 2. 토큰 검증
  const token = req.cookies.get(COOKIE)?.value;
  let payload: AuthPayload | null = null;

  if (token) {
    try {
      const verified = await jwtVerify(token, getSecret(), VERIFY_OPTS);
      payload = verified.payload as AuthPayload;
    } catch {
      // 토큰 만료 등
    }
  }

  // 3. 비로그인 접근 차단
  if (!isPublicPath(pathname) && !payload) {
    return redirectToLogin(req);
  }

  // 4. [핵심] 인증 정보를 요청 헤더에 추가 (Server Component가 사용할 수 있도록)
  if (payload) {
    const modifiedHeaders = applyUserHeadersToRequest(req.headers, payload);

    // next-intl이 처리한 응답에, 수정된 요청 헤더를 포함하여 반환
    return NextResponse.next({
      request: {
        headers: modifiedHeaders,
      },
    });
  }

  // 5. 인증 정보가 없거나 Public Path인 경우, next-intl 응답을 그대로 반환
  return intlResponse;
}

/** API 요청 처리 핸들러 (통합 및 수정) */
async function handleApiRequest(req: NextRequest, pathname: string) {
  const required = !isApiPublic(pathname);
  const token = req.cookies.get(COOKIE)?.value;

  if (!token) {
    if (required) {
      return NextResponse.json(
        { ok: false, code: "UNAUTHORIZED", error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  try {
    const { payload } = await jwtVerify(token, getSecret(), VERIFY_OPTS);
    const authPayload = payload as AuthPayload;

    // [중요] 요청 헤더를 복사해서 수정
    const requestHeaders = applyUserHeadersToRequest(req.headers, authPayload);

    // [중요] 수정된 헤더를 포함하여 다음 단계로 진행
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch {
    // 💡 [수정] catch (err) 대신 catch {}: err 변수 사용 제거
    if (required) {
      return NextResponse.json(
        { ok: false, code: "UNAUTHORIZED", error: "세션이 만료되었습니다." },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }
}

/** 페이지 리다이렉트 (유지) */
function redirectToLogin(req: NextRequest) {
  const currentCleanPath = getPathnameWithoutLocale(req.nextUrl.pathname);
  if (currentCleanPath === LOGIN_PATH_RAW) {
    return NextResponse.next();
  }

  const segments = req.nextUrl.pathname.split("/");
  // 💡 [수정] any 제거: LOCALES 배열을 사용하여 안전하게 타입 검사
  const currentLocale = (LOCALES as readonly string[]).includes(segments[1])
    ? segments[1]
    : routing.defaultLocale;

  let nextTarget = req.nextUrl.pathname + req.nextUrl.search;
  if (nextTarget.length > MAX_NEXT_LEN) nextTarget = "/";

  const loginUrl = new URL(`/${currentLocale}${LOGIN_PATH_RAW}`, req.url);
  loginUrl.searchParams.set("next", nextTarget);

  return NextResponse.redirect(loginUrl);
}

// =============================================================================
// [6] Matcher 설정
// =============================================================================

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
