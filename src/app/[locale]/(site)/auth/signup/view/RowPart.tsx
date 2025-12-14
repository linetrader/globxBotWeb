"use client";

import type { RowPartProps } from "@/app/[locale]/(site)/auth/signup/types/signup/form";
import { useState } from "react";
import { resolveUser } from "@/app/[locale]/(site)/auth/signup/utils/api";
import { useToast } from "@/components/ui/feedback/Toast-provider";
import { useTranslations } from "next-intl"; // [추가] 번역 훅 import

export function RowPart({
  value,
  onChange,
  options,
  disabled,
  errorText,
}: RowPartProps) {
  // [추가] 'authSignup' 네임스페이스 사용
  const t = useTranslations("authSignup");
  const { toast } = useToast();
  const [status, setStatus] = useState<null | "ok" | "fail">(null);

  async function onSearch(): Promise<void> {
    setStatus(null);
    const user = await resolveUser(value.ref);
    const ok = Boolean(user);
    setStatus(ok ? "ok" : "fail");

    // [수정] 토스트 메시지 다국어 적용
    toast({
      title: t("messages.checkRefTitle"), // "추천인 확인"
      description: ok
        ? t("messages.validReferrer") // "유효한 추천인입니다."
        : t("messages.invalidReferrer"), // "추천인을 찾을 수 없습니다."
      variant: ok ? "success" : "error",
      position: "top-right",
      duration: ok ? 2000 : 2500,
    });
  }

  function onNameChange(e: React.ChangeEvent<HTMLInputElement>): void {
    onChange({ ...value, name: e.target.value });
  }
  function onCountryChange(e: React.ChangeEvent<HTMLSelectElement>): void {
    const next = (e.target.value ?? "").toUpperCase();
    onChange({ ...value, countryCode: next });
  }
  function onRefChange(e: React.ChangeEvent<HTMLInputElement>): void {
    onChange({ ...value, ref: e.target.value });
    setStatus(null);
  }

  return (
    <>
      {/* 닉네임 입력 */}
      <label className="form-control w-full mt-2">
        <div className="label">
          {/* [수정] "닉네임" -> t("fields.nickname") */}
          <span className="label-text">{t("fields.nickname")}</span>
        </div>
        <input
          id="name"
          className={`input input-bordered w-full ${errorText?.name ? "input-error" : ""}`}
          value={value.name}
          onChange={onNameChange}
          autoComplete="name"
          // [수정] "token2049" -> t("fields.nicknamePlaceholder")
          placeholder={t("fields.nicknamePlaceholder")}
          disabled={disabled}
        />
        {errorText?.name ? (
          <div className="label">
            <span className="label-text-alt text-error">{errorText.name}</span>
          </div>
        ) : null}
      </label>

      {/* 국가 선택 */}
      <label className="form-control w-full mt-2">
        <div className="label">
          {/* [수정] "국가" -> t("fields.country") */}
          <span className="label-text">{t("fields.country")}</span>
        </div>
        <select
          id="countryCode"
          className={`select select-bordered w-full ${errorText?.countryCode ? "select-error" : ""}`}
          value={value.countryCode}
          onChange={onCountryChange}
          disabled={disabled}
        >
          {options.map((op) => (
            <option key={op.value} value={op.value}>
              {/* [수정] 기본값(빈값)인 경우 번역된 플레이스홀더 출력 */}
              {op.value === "" ? t("fields.countryPlaceholder") : op.label}
            </option>
          ))}
        </select>
        {errorText?.countryCode ? (
          <div className="label">
            <span className="label-text-alt text-error">
              {errorText.countryCode}
            </span>
          </div>
        ) : null}
      </label>

      {/* 추천인 입력 */}
      <label className="form-control w-full mt-2">
        <div className="label">
          {/* [수정] "추천인" -> t("fields.referrer") */}
          <span className="label-text">{t("fields.referrer")}</span>
        </div>
        <div className="flex items-start gap-2">
          <input
            id="ref"
            className={`input input-bordered w-full ${errorText?.ref ? "input-error" : ""}`}
            value={value.ref}
            onChange={onRefChange}
            // [수정] "추천인 아이디 또는 이메일" -> t("fields.referrerPlaceholder")
            placeholder={t("fields.referrerPlaceholder")}
            disabled={disabled}
            aria-describedby="ref-help"
          />
          <button
            type="button"
            className="btn btn-primary"
            onClick={onSearch}
            disabled={disabled || value.ref.trim().length === 0}
            // [수정] "검색" (aria-label) -> t("fields.search")
            aria-label={t("fields.search")}
          >
            {/* [수정] "검색" (버튼 텍스트) -> t("fields.search") */}
            {t("fields.search")}
          </button>
        </div>

        {/* 상태 메시지 */}
        {status === "ok" ? (
          <div className="label">
            <span id="ref-help" className="label-text-alt text-success">
              {/* [수정] "유효한 추천인입니다." -> t("messages.validReferrer") */}
              {t("messages.validReferrer")}
            </span>
          </div>
        ) : status === "fail" ? (
          <div className="label">
            <span id="ref-help" className="label-text-alt text-error">
              {/* [수정] "추천인을 찾을 수 없습니다." -> t("messages.invalidReferrer") */}
              {t("messages.invalidReferrer")}
            </span>
          </div>
        ) : null}

        {errorText?.ref ? (
          <div className="label">
            <span className="label-text-alt text-error">{errorText.ref}</span>
          </div>
        ) : null}
      </label>
    </>
  );
}
