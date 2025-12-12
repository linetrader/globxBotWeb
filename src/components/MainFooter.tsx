// components/MainFooter.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  WrenchScrewdriverIcon, // 봇 설정
  AdjustmentsHorizontalIcon, // 전략 설정
  Squares2X2Icon, // 대시보드
  ClockIcon, // 히스토리
  UserCircleIcon, // 개인 설정
} from "@heroicons/react/24/outline";

type Tab = {
  href: string;
  label: string;
  key: string;
  icon: ReactNode;
};

const ICON = "h-5 w-5";
const ICON_HOME = "h-6 w-6";

export default function MainFooter() {
  const pathname = usePathname();

  const isActive = (href: string): boolean => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const tabs: Tab[] = [
    {
      href: "/bot-config",
      label: "봇 설정",
      key: "bot-config",
      icon: <WrenchScrewdriverIcon className={ICON} aria-hidden />,
    },
    {
      href: "/strategy-config",
      label: "전략 설정",
      key: "strategy-config",
      icon: <AdjustmentsHorizontalIcon className={ICON} aria-hidden />,
    },
    {
      href: "/",
      label: "대시보드",
      key: "dashboard",
      icon: <Squares2X2Icon className={ICON_HOME} aria-hidden />,
    },
    {
      href: "/history",
      label: "히스토리",
      key: "history",
      icon: <ClockIcon className={ICON} aria-hidden />,
    },
    {
      href: "/my-config",
      label: "개인 설정",
      key: "my-config",
      icon: <UserCircleIcon className={ICON} aria-hidden />,
    },
  ];

  return (
    <nav
      className="
        fixed inset-x-0 bottom-0 z-40
        bg-base-100 border-t border-base-300
        py-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)]
      "
      aria-label="하단 내비게이션"
    >
      <ul className="grid grid-cols-5 gap-2 px-2">
        {tabs.map((t) => {
          const active = isActive(t.href);
          return (
            <li key={t.key}>
              <Link
                href={t.href}
                aria-label={t.label}
                aria-current={active ? "page" : undefined}
                className={`
                  flex flex-col items-center justify-center
                  gap-1 rounded-xl
                  min-h-12 py-2
                  text-[11px]
                  transition-colors
                  ${
                    active
                      ? "bg-base-200 text-base-content"
                      : "text-base-content/70 hover:bg-base-200"
                  }
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50
                `}
              >
                {t.icon}
                <span className="truncate">{t.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
