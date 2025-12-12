// src/components/ui/data/Progress.tsx
"use client";
export function Progress({
  value,
  max = 100,
  variant = "primary",
}: {
  value: number;
  max?: number;
  variant?: "primary" | "success" | "warning" | "error" | "info";
}) {
  return (
    <progress
      className={`progress progress-${variant} w-56`}
      value={value}
      max={max}
    />
  );
}
