// =============================================
// FILE: app/api/account/wallet/withdraw/route.ts (PUT)
// =============================================
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as OTPAuth from "otpauth";
import type {
  EthersV5,
  EthersV6,
  UpdateWalletRequest,
  UpdateWalletResponse,
} from "@/types/account/wallet/types";
import { getUserId } from "@/lib/request-user";

function isUpdateWalletRequest(v: unknown): v is UpdateWalletRequest {
  if (typeof v !== "object" || v === null) return false;
  const r = v as Record<string, unknown>;
  return typeof r.address === "string" && typeof r.otpCode === "string";
}

function hasGetAddressV6(m: unknown): m is EthersV6 {
  return (
    typeof m === "object" &&
    m !== null &&
    typeof (m as { getAddress?: unknown }).getAddress === "function"
  );
}
function hasGetAddressV5(m: unknown): m is EthersV5 {
  if (typeof m !== "object" || m === null) return false;
  const r = m as { utils?: unknown };
  if (typeof r.utils !== "object" || r.utils === null) return false;
  const u = r.utils as { getAddress?: unknown };
  return typeof u.getAddress === "function";
}

async function toChecksum(addr: string): Promise<string | null> {
  try {
    const mod: unknown = await import("ethers");
    if (hasGetAddressV6(mod)) return mod.getAddress(addr);
    if (hasGetAddressV5(mod)) return mod.utils.getAddress(addr);
    return null;
  } catch {
    return null;
  }
}

// -------- route --------
export async function PUT(req: Request) {
  const uid = await getUserId();
  if (!uid) {
    return NextResponse.json<UpdateWalletResponse>(
      { ok: false, code: "UNAUTHORIZED", message: "로그인이 필요합니다." },
      { status: 401 }
    );
  }

  const raw: unknown = await req.json().catch(() => null);
  if (!isUpdateWalletRequest(raw)) {
    return NextResponse.json<UpdateWalletResponse>(
      {
        ok: false,
        code: "INVALID_INPUT",
        message: "요청 형식이 올바르지 않습니다.",
      },
      { status: 400 }
    );
  }

  // 🔽 await (toChecksum이 async)
  const checksum = await toChecksum(raw.address.trim());
  const otp = raw.otpCode.replace(/\D/g, "");

  if (!checksum) {
    return NextResponse.json<UpdateWalletResponse>(
      {
        ok: false,
        code: "INVALID_ADDRESS",
        message: "유효한 EVM 주소가 아닙니다.",
      },
      { status: 400 }
    );
  }
  if (otp.length !== 6) {
    return NextResponse.json<UpdateWalletResponse>(
      { ok: false, code: "INVALID_OTP", message: "OTP 6자리를 입력하세요." },
      { status: 400 }
    );
  }

  const info = await prisma.userInfo.findUnique({
    where: { userId: uid },
    select: { googleOtpEnabled: true, googleOtpSecret: true },
  });

  if (!info?.googleOtpEnabled) {
    return NextResponse.json<UpdateWalletResponse>(
      { ok: false, code: "OTP_REQUIRED", message: "OTP 미등록 상태입니다." },
      { status: 401 }
    );
  }

  const secretB32 = info.googleOtpSecret;
  if (!secretB32) {
    return NextResponse.json<UpdateWalletResponse>(
      { ok: false, code: "OTP_NOT_INITIALIZED", message: "OTP 초기화 필요." },
      { status: 400 }
    );
  }

  const totp = new OTPAuth.TOTP({
    secret: OTPAuth.Secret.fromBase32(secretB32),
    digits: 6,
  });

  const passed = totp.validate({ token: otp, window: 1 }) !== null;
  if (!passed) {
    return NextResponse.json<UpdateWalletResponse>(
      {
        ok: false,
        code: "OTP_VERIFY_FAILED",
        message: "OTP 코드가 올바르지 않습니다.",
      },
      { status: 400 }
    );
  }

  const wallet = await prisma.userWallet.upsert({
    where: { userId: uid },
    update: { withdrawAddress: checksum },
    create: { userId: uid, withdrawAddress: checksum },
    select: { withdrawAddress: true },
  });

  return NextResponse.json<UpdateWalletResponse>(
    { ok: true, wallet: { withdrawAddress: wallet.withdrawAddress! } },
    { status: 200 }
  );
}
