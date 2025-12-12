// src/components/ui/layout/SmallCard.tsx
"use client";

import type { ReactNode, HTMLAttributes } from "react";

type SmallCardProps = {
  label: string;
  value: string;
  icon?: ReactNode; // 좌측 아이콘 슬롯
  badge?: ReactNode; // 우측 배지/액션 슬롯
} & Omit<HTMLAttributes<HTMLDivElement>, "children">;

export default function SmallCard({
  label,
  value,
  icon,
  badge,
  className,
  ...rest
}: SmallCardProps) {
  return (
    <div
      className={`rounded-xl border border-line bg-bg ${className ?? ""}`}
      {...rest}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 pt-3 pb-1">
        <div className="flex items-center gap-2 min-w-0">
          {icon ? (
            <span className="grid place-items-center">{icon}</span>
          ) : null}
          <p className="text-xs text-muted truncate">{label}</p>
        </div>
        {badge ? <div className="shrink-0">{badge}</div> : null}
      </div>

      {/* Body */}
      <div className="px-3 pb-3 pt-1">
        <p className="mt-1 text-sm font-semibold text-text">{value}</p>
      </div>
    </div>
  );
}
