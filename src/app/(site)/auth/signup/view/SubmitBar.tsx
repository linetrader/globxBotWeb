"use client";

import type { SubmitBarProps } from "@/app/(site)/auth/signup/types/signup/form";

export function SubmitBar({ loading, disabled }: SubmitBarProps) {
  return (
    <button
      type="submit"
      className="btn btn-primary w-full h-11 rounded-xl mt-4"
      disabled={Boolean(disabled)}
    >
      {loading ? "처리 중..." : "회원 가입"}
    </button>
  );
}
