// src/components/ui/typography/Caption.tsx
"use client";

import type { HTMLAttributes, ReactNode } from "react";

export type CaptionAlign = "left" | "center" | "right";
export type CaptionSize = "xs" | "sm" | "md";

export type CaptionProps = {
  children: ReactNode;
  as?: "p" | "div" | "span";
  align?: CaptionAlign;
  size?: CaptionSize;
} & Omit<HTMLAttributes<HTMLElement>, "children">;

const sizeCls: Record<CaptionSize, string> = {
  xs: "text-xs",
  sm: "text-sm",
  md: "text-base",
};

const alignCls: Record<CaptionAlign, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

export function Caption({
  children,
  as = "p",
  align = "left",
  size = "xs",
  className,
  ...rest
}: CaptionProps) {
  const Tag = as;
  return (
    <Tag
      className={[
        sizeCls[size],
        alignCls[align],
        "text-muted-foreground",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {children}
    </Tag>
  );
}
