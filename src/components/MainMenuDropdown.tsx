// src/components/MainMenuDropdown.tsx

"use client";

// [변경] next/link 대신 다국어 라우팅을 지원하는 Link 사용
import { Link } from "@/i18n/routing";
import { useCallback } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageSwitcher from "@/components/LanguageSwitcher"; // [중요] 언어 변경 버튼 컴포넌트
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
  Squares2X2Icon,
  ClockIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";

type MainMenuDropdownProps = {
  authed: boolean;
  menuOpen: boolean;
  setMenuOpen: (next: boolean) => void;
  onLogout: () => void;
};

// [민트색 정의] 로그인 버튼 색상과 동일한 값
const CYAN_COLOR = "text-[#06b6d4]";

export default function MainMenuDropdown({
  authed,
  menuOpen,
  setMenuOpen,
  onLogout,
}: MainMenuDropdownProps) {
  // 'header' 네임스페이스 사용
  const t = useTranslations("header");

  // 1. 공개 메뉴
  const publicItems = [
    { href: "/about", label: t("public.about"), icon: InformationCircleIcon },
    {
      href: "/announcements",
      label: t("public.announcements"),
      icon: MegaphoneIcon,
    },
    { href: "/cases", label: t("public.cases"), icon: TrophyIcon },
    { href: "/events", label: t("public.events"), icon: GiftIcon },
    { href: "/help", label: t("public.help"), icon: LifebuoyIcon },
  ] as const;

  // 2. 인증 메뉴
  const privateItems = [
    { href: "/bot-config", label: t("app.botConfig"), icon: CpuChipIcon },
    {
      href: "/strategy-config",
      label: t("app.strategyConfig"),
      icon: PresentationChartLineIcon,
    },
    { href: "/", label: t("app.dashboard"), icon: Squares2X2Icon },
    { href: "/history", label: t("app.history"), icon: ClockIcon },
    { href: "/my-config", label: t("app.myConfig"), icon: UserCircleIcon },
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
          <span className="sr-only">{t("aria.menu") ?? "메뉴"}</span>
          <Bars3Icon className="h-5 w-5" aria-hidden />
        </>
      }
      widthClassName="w-72 sm:w-80"
      maxHeightClassName="max-h-[70vh]"
      contentClassName="shadow-xl border border-base-300 bg-white 
        [:root[data-theme=dark]_&]:bg-black 
        [:root[data-theme=dark]_&]:border-white/10"
      closeOnItemClick
    >
      <div className="p-2">
        {/* 공개 메뉴 리스트 */}
        <ul className="menu p-1 gap-0.5 leading-tight">
          {publicItems.map((it) => (
            <li key={it.href}>
              <Link
                href={it.href}
                onClick={handleItemClick}
                className="flex items-center gap-3 rounded-lg px-3 py-1.5 hover:bg-base-200 text-sm"
              >
                {/* [수정] 아이콘 색상 변경: text-blue-600 -> 민트색 (#06b6d4) */}
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
                    onClick={handleItemClick}
                    className="flex items-center gap-3 rounded-lg px-3 py-1.5 hover:bg-base-200 text-sm"
                  >
                    {/* [수정] 아이콘 색상 변경: text-blue-600 -> 민트색 (#06b6d4) */}
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
                  onClick={onLogout}
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

        {/* ================================================= */}
        {/* 환경설정 영역 (테마 및 언어 변경 버튼 위치) */}
        {/* ================================================= */}
        <div className="my-1 border-t border-base-300 [:root[data-theme=dark]_&]:border-white/20" />
        <div
          className="p-1.5 flex flex-col gap-2"
          onClick={(e) => e.stopPropagation()} // 클릭 시 메뉴 닫힘 방지
        >
          {/* 텍스트: 환경설정 */}
          <div className="text-xs font-medium px-1 text-base-content">
            {t("aria.settings") ?? "환경설정"}
          </div>

          {/* 1. 다크모드/라이트모드 토글 버튼 */}
          <ThemeToggle size="sm" fullWidth />

          {/* 2. 언어 변경 버튼 (여기가 '한국어'라고 적힌 버튼이 됩니다) */}
          <LanguageSwitcher
            variant="icon-label" // [설정] 아이콘 + 언어이름("한국어") 표시
            // [스타일] 가로 꽉 찬 버튼 스타일 (테마 버튼과 통일감)
            triggerClassName="btn btn-outline w-full justify-start gap-2 h-9 min-h-9"
            itemClassName="flex items-center gap-2 w-full"
            // [수정] skeletonClassName 속성을 제거했습니다. (타입 오류 해결)
          />
        </div>
      </div>
    </Dropdown>
  );
}
