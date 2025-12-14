"use client";

import { Link } from "@/i18n/routing";
import { useCallback } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import { Dropdown } from "@/components/ui/overlay/Dropdown";
import { useTranslations } from "next-intl";
import {
  Bars3Icon,
  ChevronRightIcon,
  ArrowRightOnRectangleIcon,
  InformationCircleIcon,
  MegaphoneIcon,
  TrophyIcon,
  GiftIcon,
  LifebuoyIcon,
  CpuChipIcon,
  PresentationChartLineIcon,
  ClockIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";

type MainMenuDropdownProps = {
  authed: boolean;
  menuOpen: boolean;
  setMenuOpen: (next: boolean) => void;
  onLogout: () => void;
};

const CYAN_COLOR = "text-[#06b6d4]";

export default function MainMenuDropdown({
  authed,
  menuOpen,
  setMenuOpen,
  onLogout,
}: MainMenuDropdownProps) {
  const t = useTranslations("header");

  // [핵심 수정] 메뉴 닫기 핸들러 (강제 포커스 해제 추가)
  const handleLinkClick = useCallback(() => {
    // 1. React 상태 닫기
    setMenuOpen(false);

    // 2. [중요] 브라우저 포커스 강제 해제
    // (CSS focus로 인해 메뉴가 열려있는 경우를 방지)
    const activeElement = document.activeElement;
    if (activeElement instanceof HTMLElement) {
      activeElement.blur();
    }
  }, [setMenuOpen]);

  const publicItems = [
    { href: "/", label: t("public.about"), icon: InformationCircleIcon },
    {
      href: "/announcements",
      label: t("public.announcements"),
      icon: MegaphoneIcon,
    },
    { href: "/cases", label: t("public.cases"), icon: TrophyIcon },
    { href: "/events", label: t("public.events"), icon: GiftIcon },
    { href: "/help", label: t("public.help"), icon: LifebuoyIcon },
  ] as const;

  const privateItems = [
    { href: "/bot-config", label: t("app.botConfig"), icon: CpuChipIcon },
    {
      href: "/strategy-config",
      label: t("app.strategyConfig"),
      icon: PresentationChartLineIcon,
    },
    { href: "/history", label: t("app.history"), icon: ClockIcon },
    { href: "/my-config", label: t("app.apiConfig"), icon: UserCircleIcon },
  ] as const;

  return (
    <Dropdown
      end
      open={menuOpen}
      onOpenChange={setMenuOpen}
      className="relative"
      triggerClassName="btn-ghost btn-square"
      trigger={
        <>
          <span className="sr-only">{t("aria.menu") ?? "메뉴"}</span>
          <Bars3Icon className="h-5 w-5" aria-hidden />
        </>
      }
      widthClassName="w-72 sm:w-80"
      maxHeightClassName="max-h-[70vh]"
      contentClassName="shadow-xl border border-base-300 bg-white 
        [:root[data-theme=dark]_&]:bg-black 
        [:root[data-theme=dark]_&]:border-white/10"
      // 내부에서 직접 닫기를 제어하므로 closeOnItemClick 속성은 제거하거나 false로 둡니다.
    >
      <div className="p-2">
        {/* 공개 메뉴 리스트 */}
        <ul className="menu p-1 gap-0.5 leading-tight">
          {publicItems.map((it) => (
            <li key={it.href}>
              <Link
                href={it.href}
                onClick={handleLinkClick} // [적용] 클릭 시 닫기 핸들러
                className="flex items-center gap-3 rounded-lg px-3 py-1.5 hover:bg-base-200 text-sm"
              >
                <it.icon
                  className={`h-5 w-5 ${CYAN_COLOR} -mt-px`}
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

        {/* 인증 메뉴 리스트 (로그인 시) */}
        {authed && (
          <>
            <div className="my-1 border-t border-base-300 [:root[data-theme=dark]_&]:border-white/20" />
            <ul className="menu p-1 gap-0.5 leading-tight">
              {privateItems.map((it) => (
                <li key={it.href}>
                  <Link
                    href={it.href}
                    onClick={handleLinkClick} // [적용] 클릭 시 닫기 핸들러
                    className="flex items-center gap-3 rounded-lg px-3 py-1.5 hover:bg-base-200 text-sm"
                  >
                    <it.icon
                      className={`h-5 w-5 ${CYAN_COLOR} -mt-px`}
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

              <li className="mt-1">
                <button
                  type="button"
                  onClick={() => {
                    onLogout();
                    handleLinkClick(); // 로그아웃 시에도 메뉴 닫기 및 포커스 해제
                  }}
                  className="btn btn-error btn-outline w-full justify-start gap-2"
                  aria-label={t("auth.logout") ?? "로그아웃"}
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" aria-hidden />
                  <span>{t("auth.logout") ?? "로그아웃"}</span>
                </button>
              </li>
            </ul>
          </>
        )}

        {/* 환경설정 영역 (테마 토글) */}
        <div className="my-1 border-t border-base-300 [:root[data-theme=dark]_&]:border-white/20" />
        <div
          className="p-1.5 flex flex-col gap-2"
          onClick={(e) => e.stopPropagation()} // 테마 토글 영역 클릭 시 메뉴 닫힘 방지
        >
          <div className="text-xs font-medium px-1 text-base-content">
            {t("aria.settings") ?? "환경설정"}
          </div>

          <ThemeToggle size="sm" fullWidth />
        </div>
      </div>
    </Dropdown>
  );
}
