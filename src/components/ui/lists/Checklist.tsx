// src/components/ui/lists/Checklist.tsx
"use client";

import type { HTMLAttributes, ReactNode } from "react";

export type ChecklistItem = {
  id?: string;
  text: ReactNode;
  ok: boolean;
};

export type ChecklistProps = {
  items: ReadonlyArray<ChecklistItem>;
  /** ok/false 색상 커스터마이즈 */
  okClassName?: string;
  failClassName?: string;
} & Omit<HTMLAttributes<HTMLUListElement>, "children">;

export function Checklist({
  items,
  className,
  okClassName,
  failClassName,
  ...rest
}: ChecklistProps) {
  const okCls = okClassName ?? "text-muted";
  const failCls = failClassName ?? "text-[salmon]";
  return (
    <ul
      className={["mt-1 space-y-1 text-xs", className ?? ""]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {items.map((it, idx) => (
        <li key={it.id ?? String(idx)} className={it.ok ? okCls : failCls}>
          {it.text}
        </li>
      ))}
    </ul>
  );
}

export default Checklist;
