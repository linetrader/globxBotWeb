// src/components/ui/feedback/DataState.tsx
"use client";

import type { HTMLAttributes, ReactNode } from "react";

type Size = "sm" | "md";

export function LoadingText({
  text = "불러오는 중…",
  size = "sm",
  icon,
  className,
  ...rest
}: {
  text?: string;
  size?: Size;
  icon?: ReactNode; // 사용자 지정 로딩 아이콘 (선택)
} & HTMLAttributes<HTMLDivElement>) {
  const sizeCls = size === "md" ? "text-base" : "text-sm";
  const cls = [
    "inline-flex items-center gap-2 text-muted-foreground",
    sizeCls,
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <div className={cls} role="status" {...rest}>
      {icon ?? (
        <span className="loading loading-spinner loading-sm" aria-hidden />
      )}
      <span>{text}</span>
    </div>
  );
}

type ErrorVariant = "danger" | "warning";

export function ErrorText({
  error,
  variant = "danger",
  size = "sm",
  icon,
  className,
  ...rest
}: {
  error: string;
  variant?: ErrorVariant; // 기본 빨간색, 경고(노랑) 선택 가능
  size?: Size;
  icon?: ReactNode; // 사용자 지정 에러 아이콘 (선택)
} & HTMLAttributes<HTMLDivElement>) {
  const color = variant === "warning" ? "text-amber-600" : "text-red-600";
  const sizeCls = size === "md" ? "text-base" : "text-sm";
  const cls = ["inline-flex items-center gap-2", color, sizeCls, className]
    .filter(Boolean)
    .join(" ");
  return (
    <div className={cls} {...rest}>
      {icon ?? (
        <svg
          aria-hidden
          className="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16Zm.75-11.5a.75.75 0 00-1.5 0v5a.75.75 0 001.5 0v-5Zm0 8a.75.75 0 10-1.5 0 .75.75 0 001.5 0Z"
            clipRule="evenodd"
          />
        </svg>
      )}
      <span>오류: {error}</span>
    </div>
  );
}

export function EmptyRow({
  colSpan,
  text = "데이터가 없습니다.",
  className,
  ...rest
}: {
  colSpan: number;
  text?: string;
} & HTMLAttributes<HTMLTableCellElement>) {
  return (
    <tr>
      <td
        className={["px-3 py-6 text-center text-muted-foreground", className]
          .filter(Boolean)
          .join(" ")}
        colSpan={colSpan}
        {...rest}
      >
        {text}
      </td>
    </tr>
  );
}

export default LoadingText;
