"use client";

import type { AgreementsProps } from "@/app/(site)/auth/signup/types/signup/form";
import Link from "next/link";

export function Agreements({
  agreeTerms,
  agreePrivacy,
  onChangeTerms,
  onChangePrivacy,
  submitted,
  disabled,
  agreementsOk,
}: AgreementsProps) {
  return (
    <>
      <label className="label cursor-pointer mt-4">
        <input
          type="checkbox"
          className="checkbox"
          checked={agreeTerms}
          onChange={(e) => onChangeTerms(e.target.checked)}
          disabled={disabled}
        />
        <span className="label-text ml-2">
          이용약관에 동의합니다.{" "}
          <Link href="/terms" className="link link-accent">
            (보기)
          </Link>
        </span>
      </label>

      <label className="label cursor-pointer">
        <input
          type="checkbox"
          className="checkbox"
          checked={agreePrivacy}
          onChange={(e) => onChangePrivacy(e.target.checked)}
          disabled={disabled}
        />
        <span className="label-text ml-2">
          개인정보 이용 정책에 동의합니다.{" "}
          <Link href="/privacy" className="link link-accent">
            (보기)
          </Link>
        </span>
      </label>

      {submitted && !agreementsOk ? (
        <div className="text-xs text-error mt-1">
          필수 동의 항목에 체크해 주세요.
        </div>
      ) : null}
    </>
  );
}
