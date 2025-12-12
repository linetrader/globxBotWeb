// src/components/ui/actions/LinkButton.tsx
"use client";

import Link from "next/link";
import type { ReactNode } from "react";

type Variant =
  | "primary"
  | "secondary"
  | "accent"
  | "ghost"
  | "link"
  | "outline"
  | "info"
  | "success"
  | "warning"
  | "error";

type Size = "xs" | "sm" | "md" | "lg";

export type LinkButtonProps = {
  href: string;
  children: ReactNode;
  className?: string;
  variant?: Variant;
  size?: Size;
  prefetch?: boolean;
  /** 새 탭 열기 */
  target?: "_blank" | "_self";
  rel?: string;
};

function variantClass(variant: Variant = "primary"): string {
  if (variant === "outline") return "btn-outline";
  if (variant === "ghost") return "btn-ghost";
  if (variant === "link") return "btn-link";
  return `btn-${variant}`; // primary | secondary | accent | info | success | warning | error
}

function sizeClass(size: Size = "md"): string {
  if (size === "xs") return "btn-xs";
  if (size === "sm") return "btn-sm";
  if (size === "lg") return "btn-lg";
  return ""; // md
}

export function LinkButton({
  href,
  children,
  className,
  variant = "primary",
  size = "md",
  prefetch,
  target,
  rel,
}: LinkButtonProps) {
  const classes = ["btn", variantClass(variant), sizeClass(size), className]
    .filter(Boolean)
    .join(" ");

  // next/link의 prefetch는 boolean | undefined
  return (
    <Link
      href={href}
      prefetch={prefetch}
      className={classes}
      target={target}
      rel={rel}
    >
      {children}
    </Link>
  );
}
