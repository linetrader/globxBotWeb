"use client";

import { useCallback, useMemo, useState, type ChangeEvent } from "react";
import { InputField } from "@/components/ui";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export type PasswordFieldProps = {
  /** input id (label과 연결됨) */
  id: string;
  /** 라벨 텍스트 (InputField가 label prop을 받는다고 가정) */
  label?: string;
  /** 비밀번호 값 (Controlled) */
  value: string;
  /** 변경 핸들러 */
  onChange: (value: string) => void;
  /** 신규 비밀번호 여부에 따라 autoComplete 기본값을 변경 */
  isNew?: boolean;

  /** 토글 표시 상태 (Controlled). 미지정 시 내부 상태 사용 */
  show?: boolean;
  /** 내부 상태 사용 시 초기 표시 상태 */
  defaultShow?: boolean;
  /** 표시 상태 변경 콜백 (Controlled일 때 필수 권장) */
  onShowChange?: (next: boolean) => void;

  /** 선택 옵션들 */
  disabled?: boolean;
  placeholder?: string;
  /** InputField로 전달할 에러 메시지 */
  errorText?: string;
  /** autoComplete 오버라이드 (기본은 isNew에 따라 설정) */
  autoComplete?:
    | "current-password"
    | "new-password"
    | "off"
    | "on"
    | "one-time-code";

  /** 추가적인 aria 라벨 (시각장애용) */
  ariaLabel?: string;
};

export function PasswordField({
  id,
  label,
  value,
  onChange,
  isNew = false,

  show,
  defaultShow = false,
  onShowChange,

  disabled,
  placeholder = "비밀번호를 입력하세요",
  errorText,
  autoComplete,
  ariaLabel,
}: PasswordFieldProps) {
  // Controlled vs Uncontrolled
  const isControlled = typeof show === "boolean";
  const [internalShow, setInternalShow] = useState<boolean>(defaultShow);
  const actualShow = isControlled ? (show as boolean) : internalShow;

  const inputType = actualShow ? "text" : "password";
  const ac = useMemo(() => {
    if (autoComplete) return autoComplete;
    return isNew ? "new-password" : "current-password";
  }, [autoComplete, isNew]);

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  const toggleShow = useCallback(() => {
    if (isControlled) {
      onShowChange?.(!show);
    } else {
      setInternalShow((s) => !s);
      onShowChange?.(!internalShow);
    }
  }, [isControlled, onShowChange, show, internalShow]);

  const eyeAria = actualShow ? "비밀번호 숨기기" : "비밀번호 표시";

  return (
    <InputField
      id={id}
      label={label}
      type={inputType}
      value={value}
      onChange={handleInputChange}
      placeholder={placeholder}
      autoComplete={ac}
      disabled={disabled}
      errorText={errorText}
      aria-label={ariaLabel}
      trailing={
        <button
          type="button"
          className="btn-icon !h-9 !w-8"
          onClick={toggleShow}
          aria-label={eyeAria}
          title={eyeAria}
        >
          {actualShow ? (
            <EyeSlashIcon className="h-7 w-7" aria-hidden />
          ) : (
            <EyeIcon className="h-7 w-7" aria-hidden />
          )}
        </button>
      }
    />
  );
}
