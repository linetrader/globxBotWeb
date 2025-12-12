// src/components/ui/fields/SelectField.tsx
"use client";

import { forwardRef } from "react";
import type { ReactNode, SelectHTMLAttributes } from "react";

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: ReactNode;
  labelHidden?: boolean;
  hint?: ReactNode;
  errorText?: ReactNode;
  id?: string;
  children: ReactNode;
};

export const SelectField = forwardRef<HTMLSelectElement, Props>(
  function SelectField(
    { label, labelHidden, hint, errorText, id, className, children, ...rest },
    ref
  ) {
    const base = [
      "select w-full",
      errorText ? "select-error" : "select-bordered",
      // 테마 색상 명시
      "bg-base-100 text-base-content",
      // 포커스/상태
      "focus:outline-none",
      // 높이/라운드 (원하면 조정)
      "h-10 min-h-10 rounded-lg",
      // 비활성
      "disabled:bg-base-200 disabled:text-base-content/70",
      // 일부 브라우저 네이티브 스타일 정리
      "appearance-none",
    ]
      .concat(className ? [className] : [])
      .join(" ");

    return (
      <div className="form-control w-full">
        {label && (
          <label
            htmlFor={id}
            className={["label", labelHidden ? "sr-only" : ""]
              .filter(Boolean)
              .join(" ")}
          >
            <span className="label-text text-xs text-muted-foreground">
              {label}
            </span>
          </label>
        )}

        <select id={id} ref={ref} className={base} {...rest}>
          {children}
        </select>

        {hint && !errorText ? (
          <label className="label">
            <span className="label-text-alt text-xs text-muted-foreground">
              {hint}
            </span>
          </label>
        ) : null}

        {errorText ? (
          <label className="label">
            <span className="label-text-alt text-xs text-error">
              {errorText}
            </span>
          </label>
        ) : null}
      </div>
    );
  }
);

export default SelectField;
