// src/components/LanguageSwitcher.tsx
"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing"; // [핵심 복원] useRouter를 다시 가져옵니다.
import {
  GlobeAltIcon,
  ChevronUpIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { useState, useRef, useEffect, useMemo } from "react";

export type LangCode = "ko" | "en" | "ja" | "zh" | "vi";
export type LangOption = { code: LangCode; label: string; flag: string };

const LANGS: LangOption[] = [
  { code: "ko", label: "한국어", flag: "🇰🇷" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
  { code: "vi", label: "Tiếng Việt", flag: "🇻🇳" },
];

type LanguageSwitcherProps = {
  variant?: "flag-label" | "icon-label";
  triggerClassName?: string;
  itemClassName?: string;
};

export default function LanguageSwitcher({
  variant = "flag-label",
  triggerClassName = "btn btn-ghost gap-2 px-3 h-10 min-h-10",
  itemClassName = "flex items-center gap-2 w-full",
}: LanguageSwitcherProps) {
  // 1. Next-Intl 훅
  const locale = useLocale();
  const router = useRouter(); // [복원] useRouter 사용
  const pathname = usePathname();

  // 2. 상태 관리 (직접 구현하여 중첩 드롭다운 충돌 방지)
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  // 3. 현재 언어 정보
  const current = useMemo<LangOption>(
    () => LANGS.find((l) => l.code === locale) ?? LANGS[0],
    [locale]
  );

  // 4. 마운트 확인
  useEffect(() => {
    setMounted(true);
  }, []);

  // 5. 외부 클릭 감지 (메뉴 닫기)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // 6. 언어 변경 핸들러
  const apply = (code: LangCode) => {
    if (code === locale) {
      setIsOpen(false);
      return;
    }

    // [최종 라우팅 로직] useRouter를 사용하여 표준 Soft Navigation을 시도합니다.
    // 이전 단계에서 window.location.assign을 사용했지만, 이것이 Next.js의
    // 라우팅 시스템을 방해하여 다른 문제를 유발했을 수 있습니다.

    // router.replace는 usePathname이 locale-agnostic path(예: /about)를
    // 반환한다고 가정하고 새 locale을 적용합니다.
    router.replace(pathname, { locale: code });

    setIsOpen(false);
  };

  if (!mounted) {
    return <div className="btn btn-ghost btn-square skeleton h-9 w-20" />;
  }

  return (
    <div ref={containerRef} className="relative w-full">
      {/* 트리거 버튼 */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`${triggerClassName} flex justify-between items-center`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          {variant === "icon-label" ? (
            <GlobeAltIcon className="h-5 w-5" />
          ) : (
            <span className="text-lg leading-none">{current.flag}</span>
          )}
          <span className="text-sm font-normal">{current.label}</span>
        </div>

        {/* 화살표 아이콘 (열림/닫힘 표시) */}
        <ChevronUpIcon
          className={`h-3 w-3 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* 드롭다운 메뉴 목록 
        - bottom-full: 버튼의 위쪽으로 열림 (하단 메뉴에 위치하므로)
        - z-[100]: 다른 요소보다 위에 표시
      */}
      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-full min-w-[160px] rounded-lg border border-base-300 bg-base-100 shadow-xl z-[100]">
          <ul className="menu p-1 gap-0.5" role="listbox">
            {LANGS.map((op) => (
              <li key={op.code}>
                <button
                  type="button"
                  onClick={() => apply(op.code)}
                  className={`${itemClassName} justify-between px-3 py-2 ${
                    op.code === locale ? "active font-bold" : ""
                  }`}
                  role="option"
                  aria-selected={op.code === locale}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg leading-none">{op.flag}</span>
                    <span className="text-sm">{op.label}</span>
                  </div>
                  {op.code === locale && <CheckIcon className="h-4 w-4" />}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
