"use client";

import type { TopPartProps } from "@/app/[locale]/(site)/auth/signup/types/signup/form";
import { useTranslations } from "next-intl"; // [추가] 번역 훅 import

export function TopPart({
  value,
  onChange,
  disabled,
  errorText,
}: TopPartProps) {
  // [추가] 'authSignup' 네임스페이스 사용
  const t = useTranslations("authSignup");

  function onUsername(e: React.ChangeEvent<HTMLInputElement>): void {
    onChange({ ...value, username: e.target.value });
  }
  function onEmail(e: React.ChangeEvent<HTMLInputElement>): void {
    onChange({ ...value, email: e.target.value });
  }

  return (
    <>
      {/* 아이디 입력 필드 */}
      <label className="form-control w-full">
        <div className="label">
          {/* [수정] "아이디" -> t("fields.username") */}
          <span className="label-text">{t("fields.username")}</span>
        </div>
        <input
          id="username"
          className={`input input-bordered w-full ${errorText?.username ? "input-error" : ""}`}
          value={value.username}
          onChange={onUsername}
          autoComplete="username"
          // [수정] "영문 소문자/숫자/밑줄 4~16자" -> t("fields.usernamePlaceholder")
          placeholder={t("fields.usernamePlaceholder")}
          disabled={disabled}
        />
        {errorText?.username ? (
          <div className="label">
            <span className="label-text-alt text-error">
              {errorText.username}
            </span>
          </div>
        ) : null}
      </label>

      {/* 이메일 입력 필드 */}
      <label className="form-control w-full mt-2">
        <div className="label">
          {/* [수정] "이메일" -> t("fields.email") */}
          <span className="label-text">{t("fields.email")}</span>
        </div>
        <input
          id="email"
          type="email"
          className={`input input-bordered w-full ${errorText?.email ? "input-error" : ""}`}
          value={value.email}
          onChange={onEmail}
          autoComplete="email"
          // [수정] "you@example.com" -> t("fields.emailPlaceholder")
          placeholder={t("fields.emailPlaceholder")}
          disabled={disabled}
        />
        {errorText?.email ? (
          <div className="label">
            <span className="label-text-alt text-error">{errorText.email}</span>
          </div>
        ) : null}
      </label>
    </>
  );
}
