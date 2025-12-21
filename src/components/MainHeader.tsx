"use client";

import { Link, usePathname as useIntlPathname } from "@/i18n/routing";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import MainMenuDropdown from "@/components/MainMenuDropdown";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useTranslations, useLocale } from "next-intl"; // 💡 [추가] useLocale import

import GlobXlogoImage from "../../public/GlobXlogo.png";
import QuantylogoImage from "../../public/Quantylogo.png";

// 환경변수에 따라 로고 이미지 결정
const BRAND = process.env.NEXT_PUBLIC_BRAND_NAME;
const logoImage = BRAND === "Quanty" ? QuantylogoImage : GlobXlogoImage;

type MainHeaderProps = {
  authed?: boolean;
  userLevel?: number;
};

export default function MainHeader({
  authed = false,
  userLevel = 0,
}: MainHeaderProps) {
  const t = useTranslations("header");
  const locale = useLocale(); // 💡 [추가] 현재 언어 가져오기
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const isManager = Number(userLevel) >= 21;

  const handleLogout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
      });
    } finally {
      setMenuOpen(false);
      // 💡 [핵심 수정] 로그아웃 시 무조건 루트('/')가 아니라, 현재 언어 경로('/ko', '/en' 등)로 이동
      // 이렇게 해야 로그아웃 후에도 언어가 유지됩니다.
      window.location.assign(`/${locale}`);
    }
  }, [locale]);

  const pathname = useIntlPathname();

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const PUBLIC_MENU = [
    { href: "/", label: t("public.about") },
    { href: "/announcements", label: t("public.announcements") },
    { href: "/cases", label: t("public.cases") },
    { href: "/events", label: t("public.events") },
    { href: "/help", label: t("public.help") },
  ];

  const APP_MENU = [
    { href: "/bot-config", label: t("app.botConfig") },
    { href: "/strategy-config", label: t("app.strategyConfig") },
    { href: "/history", label: t("app.history") },
    { href: "/my-config", label: t("app.apiConfig") },
  ];

  return (
    <header
      className="sticky top-0 z-50 border-b backdrop-blur-md transition-colors duration-300
        bg-white/90 border-gray-200
        [:root[data-theme=dark]_&]:bg-black
        [:root[data-theme=dark]_&]:border-white/10"
    >
      <div className="navbar h-16 container mx-auto px-4">
        {/* [1] 왼쪽: 로고 영역 */}
        <div className="navbar-start shrink-0 w-auto">
          <Link
            href="/"
            aria-label={t("aria.home")}
            className="inline-flex items-center lg:-ml-4"
          >
            {/* [수정] 로고 크기 확대: h-12 -> h-14, min-w-[140px] -> min-w-[160px] */}
            <div className="relative h-14 w-auto min-w-[160px] shrink-0">
              <Image
                src={logoImage}
                alt="Brand Logo"
                fill
                className="object-contain object-left"
                priority
              />
            </div>
          </Link>
        </div>

        {/* [2] 중앙: 메뉴 영역 (PC: xl 이상 보임 / Mobile: 숨김) */}
        <div className="navbar-center hidden xl:flex items-center justify-center flex-1 min-w-0">
          <ul className="menu menu-horizontal px-1 gap-1">
            {PUBLIC_MENU.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-[#06b6d4] hover:bg-transparent hover:underline whitespace-nowrap px-3 ${
                    isActive(link.href)
                      ? "text-[#06b6d4] font-bold"
                      : "text-gray-700 [:root[data-theme=dark]_&]:text-gray-300"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {authed && (
            <div className="block mx-4 shrink-0">
              <div className="h-4 w-[1px] bg-gray-300 [:root[data-theme=dark]_&]:bg-white/20" />
            </div>
          )}

          {authed && (
            <ul className="flex menu menu-horizontal px-1 gap-1">
              {APP_MENU.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`text-sm font-medium transition-colors hover:text-[#06b6d4] hover:bg-transparent hover:underline whitespace-nowrap px-3 ${
                      isActive(link.href)
                        ? "text-[#06b6d4] font-bold"
                        : "text-gray-700 [:root[data-theme=dark]_&]:text-gray-300"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* [3] 오른쪽: 버튼 영역 */}
        <div className="navbar-end flex items-center gap-2 w-auto shrink-0 ml-auto">
          {isManager && (
            <Link
              href="/admin"
              className="hidden sm:inline-flex btn btn-sm btn-outline mr-2
                border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-black
                [:root[data-theme=dark]_&]:border-white/30 [:root[data-theme=dark]_&]:text-gray-300 [:root[data-theme=dark]_&]:hover:bg-white/10 [:root[data-theme=dark]_&]:hover:text-white
                whitespace-nowrap"
            >
              {t("auth.admin")}
            </Link>
          )}

          <LanguageSwitcher
            variant="icon-only"
            direction="down"
            align="right"
            triggerClassName="btn btn-ghost btn-circle"
          />

          {!authed ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/auth/signup"
                className="btn btn-sm border-none px-3 sm:px-4 font-normal rounded-lg transition-colors text-xs sm:text-sm whitespace-nowrap
                  bg-gray-200 text-gray-800 hover:bg-gray-300
                  [:root[data-theme=dark]_&]:bg-gray-800 [:root[data-theme=dark]_&]:text-gray-200 [:root[data-theme=dark]_&]:hover:bg-gray-700"
              >
                {t("auth.signup")}
              </Link>
              <Link
                href="/auth/login"
                className="btn btn-sm bg-[#06b6d4] hover:bg-[#0891b2] text-white border-none px-3 sm:px-4 font-normal rounded-lg transition-colors shadow-lg shadow-cyan-900/20 text-xs sm:text-sm whitespace-nowrap"
              >
                {t("auth.login")}
              </Link>
            </div>
          ) : (
            // 💡 [수정] 모바일에서도 항상 보이도록 'hidden sm:inline-flex' -> 'inline-flex'로 변경
            <Link
              href="/account"
              aria-label={t("aria.myAccount")}
              className="btn btn-ghost btn-circle inline-flex 
                text-gray-700 hover:bg-gray-100
                [:root[data-theme=dark]_&]:text-gray-300 [:root[data-theme=dark]_&]:hover:text-white [:root[data-theme=dark]_&]:hover:bg-white/10"
            >
              <UserCircleIcon className="h-6 w-6" aria-hidden />
            </Link>
          )}

          <div className="ml-1 text-gray-700 [:root[data-theme=dark]_&]:text-gray-300">
            <MainMenuDropdown
              authed={authed}
              menuOpen={menuOpen}
              setMenuOpen={setMenuOpen}
              onLogout={handleLogout}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
