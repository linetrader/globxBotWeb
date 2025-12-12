// src/components/ui/layout/PageHeader.tsx
"use client";

import type { HTMLAttributes, ReactNode } from "react";

export type PageHeaderProps = {
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
} & Omit<HTMLAttributes<HTMLElement>, "title">;

export function PageHeader({
  title,
  subtitle,
  actions,
  className,
  ...rest
}: PageHeaderProps) {
  return (
    <header
      className={["flex items-center justify-between gap-3", className]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      <div>
        <h1 className="text-xl font-semibold">{title}</h1>
        {subtitle ? (
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      {actions ? <div className="flex gap-2">{actions}</div> : null}
    </header>
  );
}

export default PageHeader;
