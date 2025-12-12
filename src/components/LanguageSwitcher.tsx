// src/components/LanguageSwitcher.tsx
"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { Dropdown } from "@/components/ui/overlay/Dropdown";
import { GlobeAltIcon } from "@heroicons/react/24/outline";

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
  /** 외부에서 제어할 때 사용 (MainMenuDropdown과 유사) */
  open?: boolean;
  setOpen?: (next: boolean) => void;

  /** 현재 언어 값을 외부 제어형으로 전달하고 싶을 때 */
  value?: LangCode;
  defaultValue?: LangCode;
  onChange?: (code: LangCode) => void;

  /** UI 옵션 */
  variant?: "flag-label" | "icon-label";
  triggerClassName?: string; // Dropdown의 래핑 버튼에 적용될 클래스 (btn 계열만 넘기면 됨)
  itemClassName?: string; // 각 항목 버튼 클래스
  widthClassName?: string; // 드롭다운 폭
  maxHeightClassName?: string; // 스크롤 높이
  contentClassName?: string;

  /** 언어 선택 영역 클릭 시 상위 드롭다운 닫힘 방지 */
  stopPropagationInContainer?: boolean; // default: true

  /** 로컬 퍼시스턴스 + <html lang> 반영 여부 */
  persist?: boolean; // default: true

  /** 로딩 스켈레톤 */
  skeletonClassName?: string;
};

export default function LanguageSwitcher({
  open,
  setOpen,
  value,
  defaultValue = "ko",
  onChange,
  variant = "flag-label",
  triggerClassName = "btn btn-ghost gap-2 px-3 h-10 min-h-10",
  itemClassName = "flex items-center gap-2 w-full",
  widthClassName = "w-44",
  maxHeightClassName = "max-h-[70vh]",
  contentClassName,
  stopPropagationInContainer = true,
  persist = true,
  skeletonClassName = "btn btn-ghost btn-square skeleton h-10 w-20",
}: LanguageSwitcherProps) {
  // 제어형/비제어형 open
  const isOpenControlled =
    typeof open === "boolean" && typeof setOpen === "function";
  const [innerOpen, setInnerOpen] = useState<boolean>(false);
  const actualOpen = isOpenControlled ? (open as boolean) : innerOpen;
  const setActualOpen = useCallback(
    (next: boolean) => (isOpenControlled ? setOpen!(next) : setInnerOpen(next)),
    [isOpenControlled, setOpen]
  );

  // 제어형/비제어형 value
  const isValueControlled = typeof value === "string";
  const [innerLang, setInnerLang] = useState<LangCode>(defaultValue);

  // mount 후 localStorage에서 언어 복구
  const [mounted, setMounted] = useState<boolean>(false);
  useEffect(() => {
    setMounted(true);
    try {
      const saved = (localStorage.getItem("lang") as LangCode | null) ?? null;
      if (!isValueControlled) {
        const next =
          saved && LANGS.some((l) => l.code === saved) ? saved : defaultValue;
        setInnerLang(next);
        if (persist) {
          document.documentElement.setAttribute("lang", next);
        }
      } else if (persist && value) {
        document.documentElement.setAttribute("lang", value);
      }
    } catch {
      if (!isValueControlled) {
        setInnerLang(defaultValue);
      }
      if (persist) {
        document.documentElement.setAttribute("lang", defaultValue);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 외부 value 바뀔 때 html lang 반영
  useEffect(() => {
    if (persist && isValueControlled && value) {
      document.documentElement.setAttribute("lang", value);
    }
  }, [isValueControlled, persist, value]);

  const lang: LangCode = isValueControlled ? (value as LangCode) : innerLang;

  const current = useMemo<LangOption>(
    () => LANGS.find((l) => l.code === lang) ?? LANGS[0],
    [lang]
  );

  const apply = (code: LangCode) => {
    if (isValueControlled) {
      onChange?.(code);
    } else {
      setInnerLang(code);
      onChange?.(code);
    }
    if (persist) {
      try {
        localStorage.setItem("lang", code);
      } catch {}
      document.documentElement.setAttribute("lang", code);
    }
    setActualOpen(false);
  };

  if (!mounted) {
    return <div className={skeletonClassName} aria-hidden />;
  }

  // MainMenuDropdown 패턴: trigger는 fragment만 넘겨 Dropdown이 button으로 감싸게 함
  const Trigger = () => {
    if (variant === "icon-label") {
      return (
        <>
          <GlobeAltIcon className="h-5 w-5" aria-hidden />
          <span className="text-sm">{current.label}</span>
        </>
      );
    }
    // flag-label
    return (
      <>
        <span className="text-lg leading-none">{current.flag}</span>
        <span className="text-sm">{current.label}</span>
      </>
    );
  };

  return (
    <Dropdown
      end
      open={actualOpen}
      onOpenChange={setActualOpen}
      className="relative"
      triggerClassName={triggerClassName} // Dropdown이 만드는 버튼에 적용
      trigger={<Trigger />} // fragment만 전달 (중첩 button 방지)
      widthClassName={widthClassName}
      maxHeightClassName={maxHeightClassName}
      contentClassName={contentClassName}
      closeOnItemClick // 보조 (직접 setActualOpen(false)도 호출)
    >
      <div
        className="p-1"
        {...(stopPropagationInContainer
          ? { onClick: (e) => e.stopPropagation() }
          : {})}
      >
        <ul className="menu p-1 gap-0.5">
          {LANGS.map((op) => (
            <li key={op.code}>
              <button
                type="button"
                className={`${itemClassName} ${op.code === lang ? "font-semibold" : ""}`}
                onClick={() => apply(op.code)}
              >
                {variant === "icon-label" ? (
                  <GlobeAltIcon className="h-5 w-5" aria-hidden />
                ) : (
                  <span className="text-lg leading-none">{op.flag}</span>
                )}
                <span className="text-sm">{op.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </Dropdown>
  );
}
