// =============================================
// FILE: app/api/account/otp/register/route.ts (POST)
// =============================================
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as OTPAuth from "otpauth";
import type {
  OtpRegisterBody,
  OtpRegisterResponse,
} from "@/types/account/otp/types";
import { getUserId } from "@/lib/request-user";

export async function POST(req: Request) {
  const uid = await getUserId();
  if (!uid)
    return NextResponse.json<OtpRegisterResponse>(
      { ok: false, message: "UNAUTHORIZED" },
      { status: 401 }
    );

  const body = (await req.json().catch(() => ({}))) as OtpRegisterBody;
  const code = (body?.code ?? "").replace(/\D/g, "");
  if (code.length !== 6)
    return NextResponse.json<OtpRegisterResponse>(
      { ok: false, message: "INVALID_CODE" },
      { status: 400 }
    );

  const info = await prisma.userInfo.findUnique({
    where: { userId: uid },
    select: { googleOtpSecret: true },
  });
  const secretB32 = info?.googleOtpSecret;
  if (!secretB32)
    return NextResponse.json<OtpRegisterResponse>(
      { ok: false, message: "OTP_NOT_INITIALIZED" },
      { status: 400 }
    );

  const totp = new OTPAuth.TOTP({
    secret: OTPAuth.Secret.fromBase32(secretB32),
    digits: 6,
  });
  const ok = totp.validate({ token: code, window: 1 }) !== null; // +-1 step 허용
  if (!ok)
    return NextResponse.json<OtpRegisterResponse>(
      { ok: false, message: "OTP_VERIFY_FAILED" },
      { status: 400 }
    );

  await prisma.userInfo.update({
    where: { userId: uid },
    data: { googleOtpEnabled: true },
  });
  return NextResponse.json<OtpRegisterResponse>({ ok: true }, { status: 200 });
}
