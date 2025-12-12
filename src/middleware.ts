// middleware.ts (no-any strict 타입화 버전)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify, type JWTPayload, type JWTVerifyOptions } from "jose";

const COOKIE = process.env.JWT_COOKIE_NAME || "super_bot";
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

const PUBLIC_PATHS: RegExp[] = [
  /^\/$/,
  /^\/home(?:\/.*)?$/,
  /^\/wallet(?:\/.*)?$/,

  /^\/auth\/login(?:\/.*)?$/,
  /^\/auth\/signup(?:\/.*)?$/,

  /^\/api\/home\/.*$/,
  /^\/api\/wallet\/.*$/,

  /^\/api\/auth\/login$/,
  /^\/api\/auth\/logout$/,
  /^\/api\/auth\/signup$/,
  /^\/api\/auth\/resolve-user$/,
];

function isPublic(pathname: string) {
  return PUBLIC_PATHS.some((re) => re.test(pathname));
}

/** JWT payload에 우리가 넣는 커스텀 클레임들 */
interface AuthPayload extends JWTPayload {
  userId?: string;
  email?: string;
  level?: number | string;
}

/** level: number|string|undefined → "0"|"<number>" */
function extractLevelString(payload: AuthPayload): string {
  const v = payload.level;
  const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : 0;
  return Number.isFinite(n) ? String(n) : "0";
}

function setUserHeaders(req: NextRequest, payload: AuthPayload) {
  // userId는 userId 또는 sub를 사용 (둘 다 없으면 비인증)
  const userId =
    (typeof payload.userId === "string" && payload.userId) ||
    (typeof payload.sub === "string" && payload.sub) ||
    "";
  if (!userId) return NextResponse.next();

  const email = typeof payload.email === "string" ? payload.email : "";
  const levelStr = extractLevelString(payload);

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-user-id", userId);
  requestHeaders.set("x-user-level", levelStr); // 항상 세팅
  if (email) requestHeaders.set("x-user-email", email);
  if (typeof payload.jti === "string") {
    requestHeaders.set("x-session-jti", payload.jti);
  }

  const res = NextResponse.next({ request: { headers: requestHeaders } });

  // 개발 중엔 네트워크 탭에서 바로 확인 가능
  if (process.env.NODE_ENV !== "production") {
    res.headers.set("x-debug-user-level", levelStr);
  }
  return res;
}

async function attachUserIfValid(req: NextRequest) {
  const token = req.cookies.get(COOKIE)?.value;
  if (!token) return NextResponse.next();

  try {
    const { payload } = await jwtVerify(token, getSecret(), VERIFY_OPTS);
    return setUserHeaders(req, payload as AuthPayload);
  } catch {
    // 토큰 무효면 소프트 패스
    return NextResponse.next();
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1) 로그인 경로(루프 방지)
  if (pathname.startsWith(LOGIN_PATH)) {
    return attachUserIfValid(req);
  }

  // 2) 공개 경로: 소프트 인증
  if (isPublic(pathname)) {
    return attachUserIfValid(req);
  }

  // 3) 보호 경로: 강제 인증
  const token = req.cookies.get(COOKIE)?.value;
  if (!token) return redirectOr401(req);

  try {
    const { payload } = await jwtVerify(token, getSecret(), VERIFY_OPTS);
    return setUserHeaders(req, payload as AuthPayload);
  } catch {
    return redirectOr401(req);
  }
}

function redirectOr401(req: NextRequest) {
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
  } catch {}
  if (nextTarget.length > MAX_NEXT_LEN) nextTarget = "/";

  const login = new URL(LOGIN_PATH, req.url);
  login.searchParams.set("next", nextTarget);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
