// src/components/ui/data/Badge.tsx
"use client";
import type { ReactNode } from "react";
export function Badge({
  children,
  variant = "neutral",
}: {
  children: ReactNode;
  variant?:
    | "neutral"
    | "primary"
    | "secondary"
    | "accent"
    | "success"
    | "warning"
    | "error"
    | "info";
}) {
  return (
    <span
      className={`badge ${variant !== "neutral" ? `badge-${variant}` : ""}`}
    >
      {children}
    </span>
  );
}
