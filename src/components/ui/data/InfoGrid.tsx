// src/components/ui/data/InfoGrid.tsx
"use client";

import type { HTMLAttributes, ReactNode } from "react";

export type InfoItem = { label: ReactNode; value: ReactNode };

export type InfoGridProps = {
  items: InfoItem[];
  /** 1열~N열(기본 2열) */
  columns?: 1 | 2 | 3 | 4;
  /** 라벨 대문자/작게 표시를 끄고 싶을 때 */
  compactLabel?: boolean;
} & HTMLAttributes<HTMLDListElement>;

export function InfoGrid({
  items,
  columns = 2,
  compactLabel,
  className,
  ...rest
}: InfoGridProps) {
  const colCls =
    columns === 1
      ? "grid-cols-1"
      : columns === 2
      ? "grid-cols-1 sm:grid-cols-2"
      : columns === 3
      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";

  const rootCls = ["grid gap-4", colCls, className].filter(Boolean).join(" ");

  const labelCls = compactLabel
    ? "text-xs text-muted-foreground"
    : "text-xs uppercase text-muted-foreground";

  return (
    <dl className={rootCls} {...rest}>
      {items.map((it, i) => (
        <div key={i} className="min-w-0">
          <dt className={labelCls}>{it.label}</dt>
          <dd className="text-sm break-words">{it.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export default InfoGrid;
