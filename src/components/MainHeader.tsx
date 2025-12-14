// src/components/MainHeader.tsx

"use client";

// [변경] next/link 대신 다국어 라우팅을 위해 @/i18n/routing의 Link 사용
// [핵심 수정] usePathname을 next/navigation 대신 @/i18n/routing에서 가져오기 위해 이름을 변경 (예: useIntlPathname)
import { Link, usePathname as useIntlPathname } from "@/i18n/routing";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image"; // 💡 [추가] Image import
import { UserCircleIcon } from "@heroicons/react/24/outline";
import MainMenuDropdown from "@/components/MainMenuDropdown";
import { useTranslations } from "next-intl"; // [추가] 번역 훅

// [중요] 로고 파일이 src/components 폴더 안에 있어야 합니다.
import logoImage from "./logo.png";

type MainHeaderProps = {
  authed?: boolean;
  userLevel?: number;
};

// [민트색 정의] MainMenuDropdown과 통일
// 💡 [수정] 사용하지 않는 CYAN_COLOR 변수 제거
// const CYAN_COLOR = "text-[#06b6d4]";

export default function MainHeader({
  authed = false,
  userLevel = 0,
}: MainHeaderProps) {
  // [추가] 'header' 네임스페이스(header.json)를 사용하여 번역 함수 생성
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
      // window.location.assign("/") 대신 next-intl 라우터를 사용해야 안전하지만,
      // 로그아웃 후 기본 URL로 이동하는 로직이므로 일단 유지합니다.
      window.location.assign("/");
    }
  }, []);

  // [핵심 수정] next-intl의 usePathname (Locale-agnostic) 사용
  const pathname = useIntlPathname();

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    // pathname에 Locale 접두사가 없으므로 단순 경로 비교가 가능합니다.
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  // [이동 및 수정] 번역 함수 t를 사용하기 위해 메뉴 배열을 컴포넌트 내부로 이동

  // 1. 왼쪽 메뉴 (공개 정보)
  const PUBLIC_MENU = [
    { href: "/", label: t("public.about") },
    { href: "/announcements", label: t("public.announcements") },
    { href: "/cases", label: t("public.cases") },
    { href: "/events", label: t("public.events") },
    { href: "/help", label: t("public.help") },
  ];

  // 2. 오른쪽 메뉴 (앱 기능)
  const APP_MENU = [
    { href: "/bot-config", label: t("app.botConfig") },
    { href: "/strategy-config", label: t("app.strategyConfig") },
    { href: "/history", label: t("app.history") },
    { href: "/my-config", label: t("app.myConfig") },
  ];

  return (
    // [스타일 유지] 설정 파일 없이 다크모드 강제 적용 로직 그대로 유지
    <header
      className="sticky top-0 z-50 border-b backdrop-blur-md transition-colors duration-300
        bg-white/90 border-gray-200
        [:root[data-theme=dark]_&]:bg-black
        [:root[data-theme=dark]_&]:border-white/10"
    >
      <div className="navbar h-16 container mx-auto px-4">
        {/* ============================== */}
        {/* [1] 왼쪽: 로고 영역 */}
        {/* ============================== */}
        <div className="navbar-start">
          <Link
            href="/" // 로고 클릭 시 경로를 /about으로 변경
            aria-label={t("aria.home")} // [번역 적용] 홈으로 이동
            className="inline-flex items-center lg:-ml-4"
          >
            <div className="relative h-6 md:h-7 w-auto shrink-0">
              {/* 💡 [수정] <img> 대신 <Image /> 사용 */}
              <Image
                src={logoImage.src}
                alt="GlobX Logo"
                fill // 부모 div의 height/width를 사용하기 위해 fill 사용
                className="object-contain" // object-contain은 fill과 함께 사용
                // unoptimized: 로고는 보통 작고 최적화가 불필요할 수 있으므로 추가
                unoptimized
              />
            </div>
          </Link>
        </div>

        {/* ============================== */}
        {/* [2] 중앙: 메뉴 영역 */}
        {/* ============================== */}
        <div className="navbar-center hidden lg:flex items-center justify-center">
          {/* 2-1. 공개 메뉴 */}
          <ul className="hidden xl:flex menu menu-horizontal px-1 gap-4">
            {PUBLIC_MENU.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  // [수정] 마우스 올렸을 때 밑줄 추가
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
              {/* 구분선 스타일 유지 */}
              <div className="h-4 w-[1px] bg-gray-300 [:root[data-theme=dark]_&]:bg-white/20" />
            </div>
          )}

          {authed && (
            <ul className="flex menu menu-horizontal px-1 gap-4">
              {APP_MENU.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    // [수정] 마우스 올렸을 때 밑줄 추가
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

        {/* ============================== */}
        {/* [3] 오른쪽: 버튼 영역 */}
        {/* ============================== */}
        <div className="navbar-end items-center gap-2">
          {isManager && (
            <Link
              href="/admin"
              // [관리자 버튼] 스타일 유지
              className="hidden sm:inline-flex btn btn-sm btn-outline mr-2
                border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-black
                [:root[data-theme=dark]_&]:border-white/30 [:root[data-theme=dark]_&]:text-gray-300 [:root[data-theme=dark]_&]:hover:bg-white/10 [:root[data-theme=dark]_&]:hover:text-white"
            >
              {t("auth.admin")} {/* [번역 적용] 관리 */}
            </Link>
          )}

          {/* 로그인/회원가입 분기 */}
          {!authed ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/auth/signup"
                // [회원가입 버튼] 스타일 유지
                className="btn btn-sm border-none px-3 sm:px-4 font-normal rounded-lg transition-colors text-xs sm:text-sm
                  bg-gray-200 text-gray-800 hover:bg-gray-300
                  [:root[data-theme=dark]_&]:bg-gray-800 [:root[data-theme=dark]_&]:text-gray-200 [:root[data-theme=dark]_&]:hover:bg-gray-700"
              >
                {t("auth.signup")} {/* [번역 적용] 회원가입 */}
              </Link>
              <Link
                href="/auth/login"
                // [로그인 버튼] 스타일 유지
                className="btn btn-sm bg-[#06b6d4] hover:bg-[#0891b2] text-white border-none px-3 sm:px-4 font-normal rounded-lg transition-colors shadow-lg shadow-cyan-900/20 text-xs sm:text-sm"
              >
                {t("auth.login")} {/* [번역 적용] 로그인 */}
              </Link>
            </div>
          ) : (
            /* 로그인 상태: 프로필 아이콘 */
            <Link
              href="/account"
              aria-label={t("aria.myAccount")} // [번역 적용] 내 계정
              className="btn btn-ghost btn-circle hidden sm:inline-flex 
                text-gray-700 hover:bg-gray-100
                [:root[data-theme=dark]_&]:text-gray-300 [:root[data-theme=dark]_&]:hover:text-white [:root[data-theme=dark]_&]:hover:bg-white/10"
            >
              <UserCircleIcon className="h-6 w-6" aria-hidden />
            </Link>
          )}

          {/* 모바일 햄버거 메뉴 아이콘 */}
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
