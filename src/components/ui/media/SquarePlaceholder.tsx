// src/components/ui/media/SquarePlaceholder.tsx
"use client";

import type { HTMLAttributes, ReactNode } from "react";

export type SquarePlaceholderProps = {
  /** 정사각형 한 변(px) */
  size?: number;
  /** 중앙 텍스트/노드 */
  children?: ReactNode;
} & Omit<HTMLAttributes<HTMLDivElement>, "children">;

export function SquarePlaceholder({
  size = 220,
  children = "로딩 중…",
  className,
  ...rest
}: SquarePlaceholderProps) {
  return (
    <div
      className={[
        "grid place-items-center rounded border border-base-300 bg-base-100 text-muted-foreground",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ width: size, height: size }}
      {...rest}
    >
      {children}
    </div>
  );
}
