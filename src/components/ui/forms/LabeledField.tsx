// src/components/ui/forms/LabeledField.tsx
"use client";

import type { ReactNode, HTMLAttributes } from "react";

export type LabeledFieldProps = {
  icon?: ReactNode;
  label: string;
  /** 라벨과 필드 사이 여백 (기본: sm) */
  gap?: "xs" | "sm" | "md";
  /** 라벨 텍스트 크기 (기본: xs) */
  labelSize?: "xs" | "sm";
  children: ReactNode;
} & Omit<HTMLAttributes<HTMLDivElement>, "children">;

const gapCls: Record<NonNullable<LabeledFieldProps["gap"]>, string> = {
  xs: "mb-0.5",
  sm: "mb-1",
  md: "mb-2",
};

const sizeCls: Record<NonNullable<LabeledFieldProps["labelSize"]>, string> = {
  xs: "text-xs",
  sm: "text-sm",
};

export function LabeledField({
  icon,
  label,
  gap = "sm",
  labelSize = "xs",
  className,
  children,
  ...rest
}: LabeledFieldProps) {
  return (
    <div className={className} {...rest}>
      <div
        className={`${gapCls[gap]} flex items-center gap-1 text-muted ${sizeCls[labelSize]}`}
      >
        {icon ? (
          <span aria-hidden className="inline-grid place-items-center">
            {icon}
          </span>
        ) : null}
        <span>{label}</span>
      </div>
      {children}
    </div>
  );
}
