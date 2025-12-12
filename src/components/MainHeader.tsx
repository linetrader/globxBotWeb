// src/components/MainHeader.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import logo from "../../public/logo.png";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import MainMenuDropdown from "@/components/MainMenuDropdown";

type MainHeaderProps = {
  authed?: boolean;
  userLevel?: number;
};

export default function MainHeader({
  authed = false,
  userLevel = 0,
}: MainHeaderProps) {
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

  const pathname = usePathname();
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-base-300 bg-base-100/95 backdrop-blur">
      <div className="navbar h-14 text-base-content container mx-auto px-3">
        {/* 왼쪽: 로고 */}
        <div className="navbar-start">
          <Link
            href="/"
            aria-label="홈으로 이동"
            className="inline-flex items-center gap-2"
          >
            <div className="relative h-8 w-[100px] shrink-0">
              <Image
                src={logo}
                alt="qflow 로고"
                fill
                priority
                className="object-cover object-center"
                sizes="120px"
              />
            </div>
          </Link>
        </div>

        {/* 오른쪽: 메뉴 */}
        <div className="navbar-end ml-auto items-center gap-2">
          {/* ≥sm: 데스크탑/태블릿 */}
          <div className="hidden sm:flex items-center gap-2">
            {isManager && (
              <Link
                href="/admin"
                aria-label="관리자 대시보드"
                className="btn btn-sm btn-outline"
              >
                관리
              </Link>
            )}

            {!authed ? (
              <>
                <Link
                  href="/auth/login"
                  aria-label="로그인"
                  className="btn btn-sm btn-outline"
                >
                  로그인
                </Link>
                <Link
                  href="/auth/signup"
                  aria-label="회원가입"
                  className="btn btn-sm btn-primary"
                >
                  회원가입
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/account"
                  aria-label="내 계정"
                  className="btn btn-ghost btn-square"
                >
                  <UserCircleIcon className="h-5 w-5" aria-hidden />
                </Link>
              </>
            )}
          </div>

          {/* <sm: 모바일 */}
          <div className="flex sm:hidden items-center gap-2">
            {!authed ? (
              <>
                <Link
                  href="/auth/login"
                  aria-label="로그인"
                  className="btn btn-xs btn-outline"
                >
                  로그인
                </Link>
                <Link
                  href="/auth/signup"
                  aria-label="회원가입"
                  className="btn btn-xs btn-primary"
                >
                  회원가입
                </Link>
              </>
            ) : (
              <Link
                href="/account"
                aria-label="내 계정"
                className="btn btn-ghost btn-square"
              >
                <UserCircleIcon className="h-5 w-5" aria-hidden />
              </Link>
            )}
          </div>

          {/* 공통: 햄버거 메뉴 드롭다운 */}
          <MainMenuDropdown
            authed={authed}
            menuOpen={menuOpen}
            setMenuOpen={setMenuOpen}
            onLogout={handleLogout}
          />
        </div>
      </div>
    </header>
  );
}
