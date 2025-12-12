// src/components/ui/typography/Note.tsx
"use client";

import type { HTMLAttributes, ReactNode } from "react";

export type NoteProps = {
  children: ReactNode;
  size?: "xs" | "sm";
  icon?: ReactNode; // 선택 아이콘
} & Omit<HTMLAttributes<HTMLParagraphElement>, "children">;

const sizeCls = {
  xs: "text-[11px]",
  sm: "text-xs",
} as const;

export function Note({
  children,
  size = "xs",
  icon,
  className,
  ...rest
}: NoteProps) {
  return (
    <p
      className={[
        "text-muted-foreground inline-flex items-start gap-2",
        sizeCls[size],
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {icon ? (
        <span aria-hidden className="mt-0.5">
          {icon}
        </span>
      ) : null}
      <span>{children}</span>
    </p>
  );
}
