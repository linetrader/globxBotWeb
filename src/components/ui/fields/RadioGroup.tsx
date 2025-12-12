// src/components/ui/fields/RadioGroup.tsx
"use client";
import type { ReactNode } from "react";

export function RadioGroup<T extends string>({
  name,
  value,
  onChange,
  options,
  label,
}: {
  name: string;
  value: T;
  onChange: (val: T) => void;
  options: { value: T; label: ReactNode }[];
  label?: ReactNode;
}) {
  return (
    <div className="form-control">
      {label && <span className="label-text mb-2">{label}</span>}
      {options.map((o) => (
        <label
          key={String(o.value)}
          className="label cursor-pointer justify-start gap-3"
        >
          <input
            type="radio"
            name={name}
            className="radio radio-primary"
            checked={value === o.value}
            onChange={() => onChange(o.value)}
          />
          <span className="label-text">{o.label}</span>
        </label>
      ))}
    </div>
  );
}
