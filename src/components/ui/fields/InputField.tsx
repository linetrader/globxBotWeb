// src/components/ui/fields/InputField.tsx
"use client";

import { forwardRef } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: ReactNode;
  /** 시각적 라벨 숨김 (접근성용) */
  labelHidden?: boolean;
  hint?: ReactNode;
  errorText?: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
  id?: string;
};

export const InputField = forwardRef<HTMLInputElement, Props>(
  function InputField(
    {
      label,
      labelHidden,
      hint,
      errorText,
      leading,
      trailing,
      id,
      className,
      ...rest
    },
    ref
  ) {
    const hasAddon = !!leading || !!trailing;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className={[
              "mb-1 block text-xs text-muted-foreground",
              labelHidden ? "sr-only" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {label}
          </label>
        )}

        <div className={hasAddon ? "relative" : undefined}>
          {leading ? (
            <div className="pointer-events-none absolute inset-y-0 left-0 grid place-items-center pl-3">
              {leading}
            </div>
          ) : null}

          <input
            id={id}
            ref={ref}
            className={[
              "w-full rounded-lg border px-3 py-2 text-sm",
              leading ? "pl-9" : "",
              trailing ? "pr-9" : "",
              className ?? "",
            ]
              .filter(Boolean)
              .join(" ")}
            {...rest}
          />

          {trailing ? (
            <div className="absolute inset-y-0 right-0 grid place-items-center pr-3">
              {trailing}
            </div>
          ) : null}
        </div>

        {hint && !errorText ? (
          <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
        ) : null}
        {errorText ? (
          <p className="mt-1 text-xs text-red-600">{errorText}</p>
        ) : null}
      </div>
    );
  }
);

export default InputField;
