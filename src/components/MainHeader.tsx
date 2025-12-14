// src/components/MainHeader.tsx

"use client";

import { Link, usePathname as useIntlPathname } from "@/i18n/routing";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import MainMenuDropdown from "@/components/MainMenuDropdown";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useTranslations } from "next-intl";

import logoImage from "./logo.png";

type MainHeaderProps = {
  authed?: boolean;
  userLevel?: number;
};

export default function MainHeader({
  authed = false,
  userLevel = 0,
}: MainHeaderProps) {
  const t = useTranslations("header");
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
      window.location.assign("/");
    }
  }, []);

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
        <div className="navbar-start">
          <Link
            href="/"
            aria-label={t("aria.home")}
            className="inline-flex items-center lg:-ml-4"
          >
            {/* 💡 [수정] 로고 크기 확대 (h-8 -> h-10, 너비 자동 조절) */}
            <div className="relative h-10 w-auto min-w-[120px] shrink-0">
              <Image
                src={logoImage}
                alt="GlobX Logo"
                fill
                className="object-contain object-left"
                priority
              />
            </div>
          </Link>
        </div>

        {/* [2] 중앙: 메뉴 영역 */}
        <div className="navbar-center hidden lg:flex items-center justify-center">
          <ul className="hidden xl:flex menu menu-horizontal px-1 gap-4">
            {PUBLIC_MENU.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-[#06b6d4] hover:bg-transparent hover:underline ${
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
            <div className="hidden xl:block mx-6">
              <div className="h-4 w-[1px] bg-gray-300 [:root[data-theme=dark]_&]:bg-white/20" />
            </div>
          )}

          {authed && (
            <ul className="flex menu menu-horizontal px-1 gap-4">
              {APP_MENU.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`text-sm font-medium transition-colors hover:text-[#06b6d4] hover:bg-transparent hover:underline ${
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
        <div className="navbar-end items-center gap-2">
          {isManager && (
            <Link
              href="/admin"
              className="hidden sm:inline-flex btn btn-sm btn-outline mr-2
                border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-black
                [:root[data-theme=dark]_&]:border-white/30 [:root[data-theme=dark]_&]:text-gray-300 [:root[data-theme=dark]_&]:hover:bg-white/10 [:root[data-theme=dark]_&]:hover:text-white"
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
                className="btn btn-sm border-none px-3 sm:px-4 font-normal rounded-lg transition-colors text-xs sm:text-sm
                  bg-gray-200 text-gray-800 hover:bg-gray-300
                  [:root[data-theme=dark]_&]:bg-gray-800 [:root[data-theme=dark]_&]:text-gray-200 [:root[data-theme=dark]_&]:hover:bg-gray-700"
              >
                {t("auth.signup")}
              </Link>
              <Link
                href="/auth/login"
                className="btn btn-sm bg-[#06b6d4] hover:bg-[#0891b2] text-white border-none px-3 sm:px-4 font-normal rounded-lg transition-colors shadow-lg shadow-cyan-900/20 text-xs sm:text-sm"
              >
                {t("auth.login")}
              </Link>
            </div>
          ) : (
            <Link
              href="/account"
              aria-label={t("aria.myAccount")}
              className="btn btn-ghost btn-circle hidden sm:inline-flex 
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
