// src/components/ui/fields/TextareaField.tsx
"use client";
import { useId } from "react";
import type { TextareaHTMLAttributes, ReactNode } from "react";

export function TextareaField({
  label,
  hint,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: ReactNode;
  hint?: ReactNode;
}) {
  const id = useId();
  return (
    <label htmlFor={id} className="form-control w-full">
      {label && (
        <div className="label">
          <span className="label-text">{label}</span>
        </div>
      )}
      <textarea
        id={id}
        className="textarea textarea-bordered w-full"
        {...props}
      />
      {hint && (
        <div className="label">
          <span className="label-text-alt">{hint}</span>
        </div>
      )}
    </label>
  );
}
