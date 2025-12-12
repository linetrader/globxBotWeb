// src/components/MainMenuDropdown.tsx
"use client";

import Link from "next/link";
import { useCallback } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Dropdown } from "@/components/ui/overlay/Dropdown";
import {
  Bars3Icon,
  ChevronRightIcon,
  CircleStackIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

type MainMenuDropdownProps = {
  authed: boolean;
  menuOpen: boolean;
  setMenuOpen: (next: boolean) => void;
  onLogout: () => void;
};

export default function MainMenuDropdown({
  authed,
  menuOpen,
  setMenuOpen,
  onLogout,
}: MainMenuDropdownProps) {
  const publicItems = [
    { href: "/about", label: "프로젝트 소개" },
    { href: "/announcements", label: "공지사항" },
    { href: "/events", label: "이벤트" },
    { href: "/help", label: "고객센터" },
  ] as const;

  const privateItems = [
    { href: "/team/list", label: "Team 리스트" },
    { href: "/revenue", label: "수익 정보" },
    { href: "/account", label: "계정설정" },
  ] as const;

  const handleItemClick = useCallback(() => {
    setMenuOpen(false);
  }, [setMenuOpen]);

  return (
    <Dropdown
      end
      open={menuOpen}
      onOpenChange={setMenuOpen}
      className="relative"
      triggerClassName="btn-ghost btn-square"
      trigger={
        <>
          <span className="sr-only">메뉴</span>
          <Bars3Icon className="h-5 w-5" aria-hidden />
        </>
      }
      widthClassName="w-72 sm:w-80"
      maxHeightClassName="max-h-[70vh]"
      contentClassName="border border-base-300 shadow-xl"
      closeOnItemClick
    >
      <div className="p-2">
        {/* 공개 메뉴 */}
        <ul className="menu p-1 gap-0.5 leading-tight">
          {publicItems.map((it) => (
            <li key={it.href}>
              <Link
                href={it.href}
                onClick={handleItemClick}
                className="flex items-center gap-3 rounded-lg px-3 py-1.5 hover:bg-base-200 text-sm"
              >
                <CircleStackIcon
                  className="h-5 w-5 text-primary -mt-px"
                  aria-hidden
                />
                <span className="text-base-content leading-none">
                  {it.label}
                </span>
                <ChevronRightIcon
                  className="ml-auto h-5 w-5 text-base-content/60 -mt-px"
                  aria-hidden
                />
              </Link>
            </li>
          ))}
        </ul>

        {/* 인증 메뉴 */}
        {authed && (
          <>
            <div className="my-1 border-t border-base-300" />
            <ul className="menu p-1 gap-0.5 leading-tight">
              {privateItems.map((it) => (
                <li key={it.href}>
                  <Link
                    href={it.href}
                    onClick={handleItemClick}
                    className="flex items-center gap-3 rounded-lg px-3 py-1.5 hover:bg-base-200 text-sm"
                  >
                    <CircleStackIcon
                      className="h-5 w-5 text-primary -mt-px"
                      aria-hidden
                    />
                    <span className="text-base-content leading-none">
                      {it.label}
                    </span>
                    <ChevronRightIcon
                      className="ml-auto h-5 w-5 text-base-content/60 -mt-px"
                      aria-hidden
                    />
                  </Link>
                </li>
              ))}

              {/* 로그아웃 버튼 */}
              <li className="mt-1">
                <button
                  type="button"
                  onClick={onLogout}
                  className="btn btn-error btn-outline w-full justify-start gap-2"
                  aria-label="로그아웃"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" aria-hidden />
                  <span>로그아웃</span>
                </button>
              </li>
            </ul>
          </>
        )}

        {/* 환경설정 (언어 선택은 상위 드롭다운 닫히지 않도록 클릭 버블링 차단) */}
        <div className="my-1 border-t border-base-300" />
        <div
          className="p-1.5 flex flex-col gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-xs font-medium px-1">환경설정</div>
          <ThemeToggle size="sm" fullWidth />
          <LanguageSwitcher
            variant="icon-label"
            triggerClassName="btn btn-outline w-full justify-start gap-2 h-9 min-h-9"
            itemClassName="flex items-center gap-2 w-full"
            skeletonClassName="btn btn-ghost btn-block skeleton h-9"
          />
        </div>
      </div>
    </Dropdown>
  );
}
