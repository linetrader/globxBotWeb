// src/components/ui/feedback/Alert.tsx
"use client";
import type { ReactNode, HTMLAttributes } from "react";

export type AlertVariant = "neutral" | "info" | "success" | "warning" | "error";

export function Alert({
  variant = "info",
  children,
  className,
  ...rest
}: {
  variant?: AlertVariant;
  children: ReactNode;
} & HTMLAttributes<HTMLDivElement>) {
  const variantClass = variant === "neutral" ? "" : `alert-${variant}`;
  return (
    <div
      className={`alert ${variantClass} ${className ?? ""}`.trim()}
      {...rest}
    >
      {children}
    </div>
  );
}
