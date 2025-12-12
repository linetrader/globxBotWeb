// =============================================
// FILE: app/api/account/otp/init/route.ts (POST)
// =============================================
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as OTPAuth from "otpauth";
import type { ApiRes } from "@/types/account/types";
import type { OtpInitResponse } from "@/types/account/otp/types";
import { getUserId } from "@/lib/request-user";

const OTP_ISSUER = process.env.OTP_ISSUER ?? "sample";

export async function POST(req: Request) {
  try {
    const uid = await getUserId();
    if (!uid) {
      return NextResponse.json<ApiRes<never>>(
        { ok: false, code: "UNAUTHORIZED", message: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const { email } = (await req.json().catch(() => ({}))) as {
      email?: string;
    };

    // 시크릿 및 otpauth URI 생성
    const secret = new OTPAuth.Secret();
    const totp = new OTPAuth.TOTP({
      issuer: OTP_ISSUER,
      label: email ?? "account",
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret,
    });

    const secretBase32 = secret.base32;
    const otpauth = totp.toString();

    // DB에 시크릿 저장(활성화 전 상태). 없으면 UserInfo 생성
    await prisma.userInfo.upsert({
      where: { userId: uid },
      update: { googleOtpSecret: secretBase32 },
      create: {
        userId: uid,
        referralCode: "", // NOTE: 이미 존재해야 정상. 신규 생성 경로가 없다면 빈 값 방지 필요
        googleOtpSecret: secretBase32,
      },
    });

    const payload: OtpInitResponse = { secretBase32, otpauth };
    return NextResponse.json(payload, { status: 200 });
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
