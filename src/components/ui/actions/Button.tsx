// src/components/ui/actions/Button.tsx
"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

export type Variant =
  | "primary"
  | "secondary"
  | "accent"
  | "ghost"
  | "link"
  | "outline"
  | "info"
  | "success"
  | "warning"
  | "error";

export type Size = "xs" | "sm" | "md" | "lg";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** 색상/스타일 변형 (기본: primary) */
  variant?: Variant;
  /** 크기 (기본: md) */
  size?: Size;
  /** 왼쪽 아이콘 */
  leftIcon?: ReactNode;
  /** 오른쪽 아이콘 */
  rightIcon?: ReactNode;
  /** 로딩 상태 - true면 disabled와 동일하게 동작하며 스피너를 표시 */
  loading?: boolean;
  /** 전체 너비 사용 */
  fullWidth?: boolean;
};

function cx(...v: Array<string | false | null | undefined>): string {
  return v.filter(Boolean).join(" ");
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      children,
      className,
      variant = "primary",
      size = "md",
      leftIcon,
      rightIcon,
      loading = false,
      disabled,
      fullWidth = false,
      type = "button",
      ...props
    },
    ref
  ) {
    const v =
      variant === "outline"
        ? "btn-outline"
        : variant === "ghost"
        ? "btn-ghost"
        : variant === "link"
        ? "btn-link"
        : `btn-${variant}`; // primary|secondary|accent|info|success|warning|error

    const s =
      size === "xs"
        ? "btn-xs"
        : size === "sm"
        ? "btn-sm"
        : size === "lg"
        ? "btn-lg"
        : "";

    const classes = cx(
      "btn",
      v,
      s,
      fullWidth && "w-full",
      loading && "pointer-events-none",
      className
    );

    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type={type}
        className={classes}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        aria-disabled={isDisabled || undefined}
        {...props}
      >
        {/* 왼쪽 스피너/아이콘 */}
        <span className="inline-flex items-center gap-2">
          {loading ? (
            <span aria-hidden className="loading loading-spinner loading-sm" />
          ) : (
            leftIcon
          )}
          <span>{children}</span>
          {rightIcon}
        </span>
      </button>
    );
  }
);

export default Button;
