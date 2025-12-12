// src/components/ui/ThemeSwitcher.tsx
"use client";

import { useEffect, useId, useState } from "react";

const THEMES = [
  "light",
  "dark",
  "cupcake",
  "bumblebee",
  "emerald",
  "corporate",
  "synthwave",
  "retro",
  "cyberpunk",
  "valentine",
  "halloween",
  "garden",
  "forest",
  "aqua",
  "lofi",
  "pastel",
  "fantasy",
  "wireframe",
  "black",
  "luxury",
  "dracula",
  "cmyk",
  "autumn",
  "business",
  "acid",
  "lemonade",
  "night",
  "coffee",
  "winter",
  "dim",
  "nord",
  "sunset",
  "caramellatte",
  "abyss",
  "silk",
] as const;

const STORAGE_KEY = "theme";

export default function ThemeSwitcher() {
  const groupName = useId();
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<string>("light"); // 항상 '제어' 상태

  useEffect(() => {
    setMounted(true);
    // 초기 테마 결정: localStorage → 시스템 다크 → DOM data-theme → "light"
    const saved =
      typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    const sysDark =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-color-scheme: dark)").matches
        ? "dark"
        : null;
    const domTheme =
      typeof document !== "undefined"
        ? document.documentElement.getAttribute("data-theme")
        : null;
    const initial = saved ?? sysDark ?? domTheme ?? "light";
    applyTheme(initial);
  }, []);

  function applyTheme(next: string) {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", next);
    }
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(STORAGE_KEY, next);
    }
    setTheme(next);
  }

  // ✅ 마운트 전에는 입력 요소 자체를 렌더하지 않음 -> uncontrolled→controlled 전환 없음
  if (!mounted) {
    return (
      <div className="flex items-center gap-4">
        <span className="badge badge-outline">
          theme:<span className="ml-1 font-mono">…</span>
        </span>
        <div className="skeleton h-8 w-48" aria-hidden />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <span className="badge badge-outline">
        theme:<span className="ml-1 font-mono">{theme}</span>
      </span>

      <div className="join join-vertical sm:join-horizontal max-w-full flex-wrap">
        {THEMES.slice(0, 5).map((t) => (
          <input
            key={t}
            type="radio"
            name={groupName}
            value={t}
            aria-label={t}
            className="join-item theme-controller btn btn-sm"
            // 항상 '제어'로 유지
            checked={theme === t}
            onChange={(e) => applyTheme(e.currentTarget.value)}
          />
        ))}

        <details className="dropdown dropdown-end join-item">
          <summary className="btn btn-sm">more</summary>
          <ul className="menu dropdown-content z-[1] p-2 shadow bg-base-100 rounded-box max-h-72 w-44 overflow-auto">
            {THEMES.slice(5).map((t) => (
              <li key={t}>
                <button
                  className={`justify-between ${theme === t ? "active" : ""}`}
                  onClick={() => applyTheme(t)}
                >
                  {t}
                  {theme === t && (
                    <span className="badge badge-primary">on</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </details>
      </div>
    </div>
  );
}
