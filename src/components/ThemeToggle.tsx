// src/components/ThemeToggle.tsx
"use client";

import { useEffect, useState } from "react";

/**
 * 공용 테마 토글
 * - 라이트/다크 2버튼
 * - 로컬스토리지("theme") 및 documentElement[data-theme] 동기화
 * - SSR 안전(마운트 전엔 스켈레톤)
 */
export default function ThemeToggle({
  size = "sm",
  fullWidth = false,
  className = "",
}: {
  size?: "xs" | "sm" | "md";
  fullWidth?: boolean; // 드로어 등에서 버튼을 가로로 늘리고 싶을 때
  className?: string;
}) {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    setMounted(true);
    try {
      const saved =
        (localStorage.getItem("theme") as "light" | "dark" | null) ?? null;
      const dom = document.documentElement.getAttribute("data-theme") as
        | "light"
        | "dark"
        | null;
      const sysDark =
        typeof window !== "undefined" &&
        window.matchMedia?.("(prefers-color-scheme: dark)").matches;

      const initial: "light" | "dark" =
        saved ??
        (dom === "light" || dom === "dark" ? dom : sysDark ? "dark" : "light");

      document.documentElement.setAttribute("data-theme", initial);
      setTheme(initial);
    } catch {
      // no-op
    }
  }, []);

  const apply = (next: "light" | "dark") => {
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {}
    setTheme(next);
  };

  if (!mounted) {
    return (
      <div
        className={`skeleton h-8 w-24 ${
          fullWidth ? "w-full" : ""
        } ${className}`}
        aria-hidden
      />
    );
  }

  const btnSize = `btn-${size}`;
  const itemGrow = fullWidth ? "flex-1" : "";

  return (
    <div className={`join ${fullWidth ? "w-full" : ""} ${className}`}>
      <button
        type="button"
        className={`btn ${btnSize} join-item ${itemGrow} ${
          theme === "light" ? "btn-active" : "btn-outline"
        }`}
        onClick={() => apply("light")}
        aria-pressed={theme === "light"}
      >
        Light
      </button>
      <button
        type="button"
        className={`btn ${btnSize} join-item ${itemGrow} ${
          theme === "dark" ? "btn-active" : "btn-outline"
        }`}
        onClick={() => apply("dark")}
        aria-pressed={theme === "dark"}
      >
        Dark
      </button>
    </div>
  );
}
