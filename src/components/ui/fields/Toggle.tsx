// src/components/ui/fields/Toggle.tsx
"use client";
import type { InputHTMLAttributes, ReactNode } from "react";

export function Toggle({
  label,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label?: ReactNode;
}) {
  return (
    <label className="label cursor-pointer justify-start gap-3">
      <input type="checkbox" className="toggle" {...props} />
      {label && <span className="label-text">{label}</span>}
    </label>
  );
}
