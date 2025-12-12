// =============================================
// FILE: app/api/account/route.ts (GET)
// =============================================
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { AccountProfile, ApiRes } from "@/types/account/types";
import { getUserId } from "@/lib/request-user";

export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json<ApiRes<never>>(
        { ok: false, code: "UNAUTHORIZED", message: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        username: true,
        email: true,
        name: true,
        info: { select: { referralCode: true, googleOtpEnabled: true } },
        country: { select: { code: true, name: true } },
        wallet: { select: { withdrawAddress: true } },
      },
    });

    if (!user || !user.info) {
      return NextResponse.json<ApiRes<never>>(
        {
          ok: false,
          code: "NOT_FOUND",
          message: "사용자 정보를 찾을 수 없습니다.",
        },
        { status: 404 }
      );
    }

    const profile: AccountProfile = {
      username: user.username,
      email: user.email,
      name: user.name,
      referralCode: user.info.referralCode,
      googleOtpEnabled: user.info.googleOtpEnabled,
      country: user.country
        ? { code: user.country.code, name: user.country.name }
        : null,
      wallet: { withdrawAddress: user.wallet?.withdrawAddress ?? null },
    };

    return NextResponse.json<ApiRes<{ profile: AccountProfile }>>({
      ok: true,
      profile,
    });
  } catch (e) {
    return NextResponse.json<ApiRes<never>>(
      {
        ok: false,
        code: "SERVER_ERROR",
        message: (e as Error)?.message ?? "SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}
