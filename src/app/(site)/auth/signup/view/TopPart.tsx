"use client";

import type { TopPartProps } from "@/app/(site)/auth/signup/types/signup/form";

export function TopPart({
  value,
  onChange,
  disabled,
  errorText,
}: TopPartProps) {
  function onUsername(e: React.ChangeEvent<HTMLInputElement>): void {
    onChange({ ...value, username: e.target.value });
  }
  function onEmail(e: React.ChangeEvent<HTMLInputElement>): void {
    onChange({ ...value, email: e.target.value });
  }

  return (
    <>
      <label className="form-control w-full">
        <div className="label">
          <span className="label-text">아이디</span>
        </div>
        <input
          id="username"
          className={`input input-bordered w-full ${errorText?.username ? "input-error" : ""}`}
          value={value.username}
          onChange={onUsername}
          autoComplete="username"
          placeholder="영문 소문자/숫자/밑줄 4~16자"
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

      <label className="form-control w-full mt-2">
        <div className="label">
          <span className="label-text">이메일</span>
        </div>
        <input
          id="email"
          type="email"
          className={`input input-bordered w-full ${errorText?.email ? "input-error" : ""}`}
          value={value.email}
          onChange={onEmail}
          autoComplete="email"
          placeholder="you@example.com"
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
