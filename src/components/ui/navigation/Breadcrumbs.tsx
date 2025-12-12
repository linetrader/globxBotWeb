// src/components/ui/navigation/Breadcrumbs.tsx
"use client";

import Link from "next/link";
import type { ReactNode } from "react";

export type BreadcrumbItem = {
  href?: string;
  label: ReactNode;
};

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="breadcrumbs text-sm">
      <ul>
        {items.map((it, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={i}>
              {it.href && !isLast ? (
                <Link href={it.href}>{it.label}</Link>
              ) : (
                <span aria-current={isLast ? "page" : undefined}>
                  {it.label}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
