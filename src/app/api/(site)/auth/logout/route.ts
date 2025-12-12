// src/app/api/auth/logout/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import type { LogoutResponse } from "@/types/auth/logout/types";

export const runtime = "nodejs";
const COOKIE_NAME = process.env.JWT_COOKIE_NAME || "super_bot";

export async function POST(): Promise<NextResponse<LogoutResponse>> {
  const store = await cookies();
  store.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0, // 삭제
  });
  // LogoutSuccess = {} 로 정의했으므로 payload 없이 ok만 반환
  return NextResponse.json({ ok: true } as LogoutResponse);
}
