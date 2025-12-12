export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import type {
  ChangePasswordBody,
  ChangePasswordResponse,
} from "@/types/account/password/types";
import { getUserId } from "@/lib/request-user";

const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS ?? 12);

// 프론트 규칙 과 동일(8~18, 문자/숫자/대문자/기호)
function validatePasswordPolicy(pw: string): string | null {
  if (pw.length < 8 || pw.length > 18) return "LENGTH";
  if (!/[A-Za-z]/.test(pw)) return "LETTER";
  if (!/\d/.test(pw)) return "DIGIT";
  if (!/[A-Z]/.test(pw)) return "UPPER";
  if (!/[^A-Za-z0-9]/.test(pw)) return "SYMBOL";
  return null;
}

export async function PUT(req: Request) {
  const uid = await getUserId();
  if (!uid) {
    return NextResponse.json<ChangePasswordResponse>(
      { ok: false, code: "UNAUTHORIZED", message: "로그인이 필요합니다." },
      { status: 401 }
    );
  }

  const body = (await req
    .json()
    .catch(() => ({}))) as Partial<ChangePasswordBody>;
  const currentPassword = body.currentPassword ?? "";
  const newPassword = body.newPassword ?? "";

  if (!currentPassword || !newPassword) {
    return NextResponse.json<ChangePasswordResponse>(
      {
        ok: false,
        code: "INVALID_INPUT",
        message: "currentPassword/newPassword 필요",
      },
      { status: 400 }
    );
  }
  if (currentPassword === newPassword) {
    return NextResponse.json<ChangePasswordResponse>(
      {
        ok: false,
        code: "SAME_PASSWORD",
        message: "새 비밀번호가 기존 비밀번호와 동일",
      },
      { status: 400 }
    );
  }

  const policyErr = validatePasswordPolicy(newPassword);
  if (policyErr) {
    return NextResponse.json<ChangePasswordResponse>(
      {
        ok: false,
        code: `POLICY_${policyErr}`,
        message: "비밀번호 정책 불만족",
      },
      { status: 400 }
    );
  }

  // 기존 해시 확인
  const user = await prisma.user.findUnique({
    where: { id: uid },
    select: { passwordHash: true },
  });
  if (!user) {
    return NextResponse.json<ChangePasswordResponse>(
      { ok: false, code: "NOT_FOUND", message: "사용자 없음" },
      { status: 404 }
    );
  }

  const ok = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!ok) {
    return NextResponse.json<ChangePasswordResponse>(
      {
        ok: false,
        code: "CURRENT_PASSWORD_INVALID",
        message: "현재 비밀번호 불일치",
      },
      { status: 400 }
    );
  }

  // 새 비밀번호 저장
  const newHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  await prisma.user.update({
    where: { id: uid },
    data: { passwordHash: newHash },
  });

  // (선택) 기존 세션 무효화/재발급 로직이 있다면 여기에 추가

  return NextResponse.json<ChangePasswordResponse>(
    { ok: true },
    { status: 200 }
  );
}
