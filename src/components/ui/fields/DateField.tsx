// src/components/ui/fields/DateField.tsx
"use client";
import { useId } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";

export function DateField({
  label,
  hint,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label?: ReactNode;
  hint?: ReactNode;
}) {
  const id = useId();
  return (
    <label htmlFor={id} className="form-control max-w-xs">
      {label && (
        <div className="label">
          <span className="label-text">{label}</span>
        </div>
      )}
      <input id={id} type="date" className="input input-bordered" {...props} />
      {hint && (
        <div className="label">
          <span className="label-text-alt">{hint}</span>
        </div>
      )}
    </label>
  );
}
