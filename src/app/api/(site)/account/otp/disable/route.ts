// app/api/account/otp/disable/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/request-user";
import type { OtpDisableResponse } from "@/types/account/otp/types";

export async function POST() {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json<OtpDisableResponse>(
      { ok: false, message: "UNAUTHORIZED" },
      { status: 401 }
    );
  }

  // UserInfo에 존재하는 OTP 필드 비활성화
  // 정책: 시크릿을 삭제하려면 null, 보존하려면 기존 값 유지
  await prisma.userInfo.update({
    where: { userId },
    data: {
      googleOtpEnabled: false,
      googleOtpSecret: null, // <- 보존하려면 이 줄 제거
    },
  });

  return NextResponse.json<OtpDisableResponse>({ ok: true }, { status: 200 });
}
