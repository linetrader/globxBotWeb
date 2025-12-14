"use client";

import type { MiddlePartProps } from "@/app/[locale]/(site)/auth/signup/types/signup/form";
import { useTranslations } from "next-intl"; // [추가] 번역 훅 import

export function MiddlePart({
  password,
  password2,
  onPasswordChange,
  onPassword2Change,
  disabled,
  checklist,
}: MiddlePartProps) {
  // [추가] 'authSignup' 네임스페이스 사용
  const t = useTranslations("authSignup");

  return (
    <>
      {/* 비밀번호 입력 필드 */}
      <label className="form-control w-full mt-2">
        <div className="label">
          {/* [수정] "패스워드" -> t("fields.password") */}
          <span className="label-text">{t("fields.password")}</span>
        </div>
        <input
          id="password"
          type="password"
          className="input input-bordered w-full"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          // [수정] "비밀번호를 입력하세요" -> t("fields.passwordPlaceholder")
          placeholder={t("fields.passwordPlaceholder")}
          aria-describedby="pw-help"
          disabled={disabled}
        />

        {/* 비밀번호 유효성 체크리스트 */}
        <ul
          id="pw-help"
          className="menu bg-base-100 rounded-box mt-2 p-2 text-sm"
        >
          <li className={checklist.len ? "text-success" : "text-error"}>
            {/* [수정] "8~18 문자 길이" -> t("checklist.len") */}
            {t("checklist.len")}
          </li>
          <li className={checklist.letter ? "text-success" : "text-error"}>
            {/* [수정] "문자 포함" -> t("checklist.letter") */}
            {t("checklist.letter")}
          </li>
          <li className={checklist.digit ? "text-success" : "text-error"}>
            {/* [수정] "숫자 포함" -> t("checklist.digit") */}
            {t("checklist.digit")}
          </li>
          <li className={checklist.upper ? "text-success" : "text-error"}>
            {/* [수정] "대문자 1자 이상" -> t("checklist.upper") */}
            {t("checklist.upper")}
          </li>
          <li className={checklist.symbol ? "text-success" : "text-error"}>
            {/* [수정] "기호 1자 이상" -> t("checklist.symbol") */}
            {t("checklist.symbol")}
          </li>
          {checklist.confirmShown && !checklist.confirmOk ? (
            <li className="text-error">
              {/* [수정] "비밀번호가 일치하지 않습니다." -> t("checklist.mismatch") */}
              {t("checklist.mismatch")}
            </li>
          ) : null}
        </ul>
      </label>

      {/* 비밀번호 확인 필드 */}
      <label className="form-control w-full mt-2">
        <div className="label">
          {/* [수정] "패스워드 확인" -> t("fields.confirmPassword") */}
          <span className="label-text">{t("fields.confirmPassword")}</span>
        </div>
        <input
          id="password2"
          type="password"
          className="input input-bordered w-full"
          value={password2}
          onChange={(e) => onPassword2Change(e.target.value)}
          // [수정] "비밀번호를 다시 입력" -> t("fields.confirmPasswordPlaceholder")
          placeholder={t("fields.confirmPasswordPlaceholder")}
          disabled={disabled}
        />
      </label>
    </>
  );
}
