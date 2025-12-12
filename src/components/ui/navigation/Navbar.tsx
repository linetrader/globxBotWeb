// src/components/ui/navigation/Navbar.tsx
"use client";
import type { ReactNode } from "react";
export function Navbar({
  left,
  right,
}: {
  left?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div className="navbar bg-base-100 border-b border-base-300">
      <div className="flex-1">{left}</div>
      <div className="flex-none gap-2">{right}</div>
    </div>
  );
}
