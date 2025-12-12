"use client";

import type { RowPartProps } from "@/app/(site)/auth/signup/types/signup/form";
import { useState } from "react";
import { resolveUser } from "@/app/(site)/auth/signup/utils/api";
import { useToast } from "@/components/ui/feedback/Toast-provider";

export function RowPart({
  value,
  onChange,
  options,
  disabled,
  errorText,
}: RowPartProps) {
  const { toast } = useToast();
  const [status, setStatus] = useState<null | "ok" | "fail">(null);

  async function onSearch(): Promise<void> {
    setStatus(null);
    const user = await resolveUser(value.ref);
    const ok = Boolean(user);
    setStatus(ok ? "ok" : "fail");
    toast({
      title: "추천인 확인",
      description: ok ? "유효한 추천인입니다." : "추천인을 찾을 수 없습니다.",
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
      <label className="form-control w-full mt-2">
        <div className="label">
          <span className="label-text">닉네임</span>
        </div>
        <input
          id="name"
          className={`input input-bordered w-full ${errorText?.name ? "input-error" : ""}`}
          value={value.name}
          onChange={onNameChange}
          autoComplete="name"
          placeholder="token2049"
          disabled={disabled}
        />
        {errorText?.name ? (
          <div className="label">
            <span className="label-text-alt text-error">{errorText.name}</span>
          </div>
        ) : null}
      </label>

      <label className="form-control w-full mt-2">
        <div className="label">
          <span className="label-text">국가</span>
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
              {op.label}
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

      <label className="form-control w-full mt-2">
        <div className="label">
          <span className="label-text">추천인</span>
        </div>
        <div className="flex items-start gap-2">
          <input
            id="ref"
            className={`input input-bordered w-full ${errorText?.ref ? "input-error" : ""}`}
            value={value.ref}
            onChange={onRefChange}
            placeholder="추천인 아이디 또는 이메일"
            disabled={disabled}
            aria-describedby="ref-help"
          />
          <button
            type="button"
            className="btn btn-primary"
            onClick={onSearch}
            disabled={disabled || value.ref.trim().length === 0}
            aria-label="추천인 검색"
          >
            검색
          </button>
        </div>

        {status === "ok" ? (
          <div className="label">
            <span id="ref-help" className="label-text-alt text-success">
              유효한 추천인입니다.
            </span>
          </div>
        ) : status === "fail" ? (
          <div className="label">
            <span id="ref-help" className="label-text-alt text-error">
              추천인을 찾을 수 없습니다.
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
