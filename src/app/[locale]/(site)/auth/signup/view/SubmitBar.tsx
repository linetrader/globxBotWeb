"use client";

import { Button } from "@/components/ui";
import type { SubmitBarProps } from "@/app/[locale]/(site)/auth/signup/types/signup/form";
import { useTranslations } from "next-intl"; // [추가] 번역 훅 import

export function SubmitBar({ loading, disabled }: SubmitBarProps) {
  // [추가] 'authSignup' 네임스페이스 사용
  const t = useTranslations("authSignup");

  return (
    <div className="pt-4">
      <Button
        type="submit"
        disabled={loading || disabled}
        // [스타일 유지] 로그인 버튼과 동일한 민트색 적용 (#06b6d4)
        className={`
          h-11 w-full rounded-xl text-base font-bold text-white shadow-lg transition-all border-none
          ${
            disabled
              ? "bg-gray-700 text-gray-400 cursor-not-allowed"
              : "bg-[#06b6d4] hover:bg-[#0891b2]"
          }
        `}
      >
        {loading ? (
          <span className="loading loading-spinner loading-sm" />
        ) : (
          // [수정] "회원가입" -> t("buttons.submit")
          t("buttons.submit")
        )}
      </Button>
    </div>
  );
}
