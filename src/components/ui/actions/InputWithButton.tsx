// src/components/ui/actions/InputWithButton.tsx
"use client";

import { forwardRef, useId } from "react";
import InputField from "../fields/InputField";
import Button from "./Button";

export type InputWithButtonProps = {
  /** HTML id. 미지정 시 자동 생성 */
  id?: string;
  name?: string;
  value: string;
  onChange: (v: string) => void;

  /** 입력 placeholder */
  placeholder?: string;

  /** 버튼 라벨 */
  buttonText: string;

  /** 버튼 클릭 핸들러 */
  onButtonClick: () => void;

  /** 전체/입력/버튼 비활성화 */
  disabled?: boolean;
  inputDisabled?: boolean;
  buttonDisabled?: boolean;

  /** 버튼 로딩 표시 */
  buttonLoading?: boolean;

  /** 하단 도움말/오류 텍스트(예: 검증 결과) */
  helpText?: React.ReactNode;

  /** 접근성 레이블/설명 연결용 */
  "aria-describedby"?: string;
  "aria-label"?: string;

  /** 추가 클래스 */
  className?: string;

  /** 입력 타입 (기본 text) */
  type?: "text" | "email" | "password" | "search";

  /** 자동완성 힌트 */
  autoComplete?: string;

  /** InputField의 에러 텍스트를 직접 제어하고 싶을 때 */
  errorText?: string;
};

export const InputWithButton = forwardRef<
  HTMLInputElement,
  InputWithButtonProps
>(function InputWithButton(
  {
    id,
    name,
    value,
    onChange,
    placeholder,
    buttonText,
    onButtonClick,
    disabled,
    inputDisabled,
    buttonDisabled,
    buttonLoading,
    helpText,
    className,
    type = "text",
    autoComplete,
    errorText,
    ...aria
  },
  ref
) {
  const autoId = useId();
  const inputId = id ?? `input-with-button-${autoId}`;
  const isInputDisabled = disabled ?? inputDisabled ?? false;
  const isButtonDisabled = disabled ?? buttonDisabled ?? false;

  return (
    <div className={className}>
      <InputField
        id={inputId}
        ref={ref}
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={isInputDisabled}
        errorText={errorText}
        // trailing 영역에 버튼 주입
        trailing={
          <Button
            type="button"
            className="join-item"
            onClick={onButtonClick}
            disabled={isButtonDisabled || buttonLoading}
          >
            {buttonLoading ? "..." : buttonText}
          </Button>
        }
        {...aria}
      />
      {helpText ? <div className="label mt-1">{helpText}</div> : null}
    </div>
  );
});

export default InputWithButton;
