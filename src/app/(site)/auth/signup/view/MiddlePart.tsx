"use client";

import type { MiddlePartProps } from "@/app/(site)/auth/signup/types/signup/form";

export function MiddlePart({
  password,
  password2,
  onPasswordChange,
  onPassword2Change,
  disabled,
  checklist,
}: MiddlePartProps) {
  return (
    <>
      <label className="form-control w-full mt-2">
        <div className="label">
          <span className="label-text">패스워드</span>
        </div>
        <input
          id="password"
          type="password"
          className="input input-bordered w-full"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          placeholder="비밀번호를 입력하세요"
          aria-describedby="pw-help"
          disabled={disabled}
        />
        <ul
          id="pw-help"
          className="menu bg-base-100 rounded-box mt-2 p-2 text-sm"
        >
          <li className={checklist.len ? "text-success" : "text-error"}>
            8~18 문자 길이
          </li>
          <li className={checklist.letter ? "text-success" : "text-error"}>
            문자 포함
          </li>
          <li className={checklist.digit ? "text-success" : "text-error"}>
            숫자 포함
          </li>
          <li className={checklist.upper ? "text-success" : "text-error"}>
            대문자 1자 이상
          </li>
          <li className={checklist.symbol ? "text-success" : "text-error"}>
            기호 1자 이상
          </li>
          {checklist.confirmShown && !checklist.confirmOk ? (
            <li className="text-error">비밀번호가 일치하지 않습니다.</li>
          ) : null}
        </ul>
      </label>

      <label className="form-control w-full mt-2">
        <div className="label">
          <span className="label-text">패스워드 확인</span>
        </div>
        <input
          id="password2"
          type="password"
          className="input input-bordered w-full"
          value={password2}
          onChange={(e) => onPassword2Change(e.target.value)}
          placeholder="비밀번호를 다시 입력"
          disabled={disabled}
        />
      </label>
    </>
  );
}
