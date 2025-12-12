// src/app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

import type { ApiError, ApiSuccess, ApiUser } from "@/types/auth/types";
import type { LoginResponse, LoginError } from "@/types/auth/login/types";

export const runtime = "nodejs";

/** 미들웨어와 동일한 기본값 */
const COOKIE_NAME = process.env.JWT_COOKIE_NAME || "super_bot";
const JWT_EXPIRES =
  process.env.JWT_EXPIRES || process.env.JWT_EXPIRES_IN || "7d"; // "7d"/"24h"/"3600"
const JWT_ISSUER = process.env.JWT_ISSUER;
const JWT_AUDIENCE = process.env.JWT_AUDIENCE;

/** HS256 secret */
function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("JWT_SECRET is missing or too short (>=16).");
  }
  return new TextEncoder().encode(secret);
}

/** "7d"/"24h"/"3600" → seconds */
function parseMaxAge(
  v: string | number | undefined,
  fallbackSec = 7 * 24 * 3600
) {
  if (typeof v === "number" && Number.isFinite(v))
    return Math.max(0, Math.floor(v));
  if (typeof v !== "string") return fallbackSec;
  const m = v.trim().match(/^(\d+)\s*([smhd])?$/i);
  if (!m) return fallbackSec;
  const n = parseInt(m[1], 10);
  const unit = (m[2] || "s").toLowerCase();
  const mult =
    unit === "s" ? 1 : unit === "m" ? 60 : unit === "h" ? 3600 : 86400;
  return n * mult;
}

/** 에러 응답 */
function bad(code: LoginError, message?: string, status = 400) {
  const body: ApiError<LoginError> = { ok: false, code, message };
  return NextResponse.json(body, { status });
}

/** 성공 응답 */
function ok(user: ApiUser) {
  const body: ApiSuccess<{ user: ApiUser }> = { ok: true, user };
  return NextResponse.json(body);
}

export async function POST(req: Request): Promise<NextResponse<LoginResponse>> {
  try {
    const body = await req.json();

    // username 또는 email 허용 + 소문자 정규화
    const rawId = String(body.id ?? body.username ?? "").trim();
    const id = rawId.toLowerCase();
    const password = String(body.password ?? "");

    if (!id || !password) {
      return bad("VALIDATION_ERROR", "Invalid input.", 400);
    }

    // ⚠️ level은 User가 아니라 UserInfo에 있음
    const user = await prisma.user.findFirst({
      where: { OR: [{ username: id }, { email: id }] },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        passwordHash: true,
        countryCode: true,
        createdAt: true,
        info: { select: { level: true } }, // ← 여기서 level 조회
      },
    });

    // 사용자 없거나 비밀번호 불일치 시 동일 에러로 응답(정보 노출 방지)
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return bad("INVALID_CREDENTIALS", "Invalid username or password.", 401);
    }

    const level = user.info?.level ?? 1;

    // JWT 발급
    const secret = getJwtSecret();
    let jwt = new SignJWT({
      userId: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      level, // ← UserInfo.level 사용
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setSubject(user.id)
      .setIssuedAt()
      .setExpirationTime(JWT_EXPIRES);

    if (JWT_ISSUER) jwt = jwt.setIssuer(JWT_ISSUER);
    if (JWT_AUDIENCE) jwt = jwt.setAudience(JWT_AUDIENCE);

    const token = await jwt.sign(secret);

    // httpOnly 쿠키 저장
    const store = await cookies();
    store.set(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: parseMaxAge(JWT_EXPIRES),
    });

    // ApiUser 스키마에 맞게 createdAt → ISO 문자열
    const safe: ApiUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      countryCode: user.countryCode,
      createdAt: user.createdAt.toISOString(),
      level, // ← UserInfo.level 사용
    };

    return ok(safe);
  } catch {
    return bad("UNKNOWN", "Internal error", 500);
  }
}
