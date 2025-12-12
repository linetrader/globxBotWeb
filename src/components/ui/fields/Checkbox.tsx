// src/components/ui/fields/Checkbox.tsx
"use client";
import { useId, useEffect, forwardRef } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";

export type CheckboxProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> & {
  label?: ReactNode;
  hint?: ReactNode;
  errorText?: ReactNode;
  indeterminate?: boolean;
  id?: string;
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox(
    {
      label,
      hint,
      errorText,
      indeterminate,
      id: idProp,
      className,
      disabled,
      ...props
    },
    ref
  ) {
    const autoId = useId();
    const id = idProp ?? autoId;

    // indeterminate 지원
    useEffect(() => {
      if (!ref || !("current" in ref) || !ref.current) return;
      if (typeof indeterminate !== "boolean") return;
      ref.current.indeterminate = indeterminate;
    }, [indeterminate, ref]);

    return (
      <label
        className={`label cursor-pointer justify-start gap-3 ${
          disabled ? "opacity-60" : ""
        }`}
      >
        <input
          id={id}
          ref={ref}
          type="checkbox"
          className={`checkbox ${className ?? ""}`}
          aria-invalid={!!errorText}
          disabled={disabled}
          {...props}
        />
        {label && <span className="label-text">{label}</span>}
        {(errorText || hint) && (
          <span
            className={`label-text-alt ${errorText ? "text-[salmon]" : ""}`}
          >
            {errorText ?? hint}
          </span>
        )}
      </label>
    );
  }
);
