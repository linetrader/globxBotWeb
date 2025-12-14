// src/app/admin/components/AdminSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
//import { useToast } from "@/components/ui";

/* ---------------------- 타입 & 데이터 ---------------------- */
type NavNode = {
  label: string;
  href?: string;
  children?: NavNode[];
};

const navTree: NavNode[] = [
  { label: "대시보드", href: "/admin" },

  {
    label: "유저 관리",
    children: [
      { label: "유저 목록", href: "/admin/users/list" },
      { label: "유저 트리", href: "/admin/users/tree" },
      // (옵션) 유저 상세는 사이드바에 안 넣고 /admin/users/[id]
    ],
  },

  {
    label: "봇 관리",
    children: [
      // 2번, 3번 요구
      { label: "봇 / 런타임", href: "/admin/bots/list" }, // TradingBot + BotRuntime
      { label: "작업 큐", href: "/admin/bots/work-queue" }, // WorkItem / WorkAttempt
      // 4번 요구
      { label: "전략 설정", href: "/admin/bots/strategy" }, // StrategyConfig
      { label: "글로벌 파라미터", href: "/admin/bots/global" }, // StrategyGlobalSettings + History
    ],
  },

  {
    label: "프로세스 관리",
    children: [
      { label: "프로세스 목록", href: "/admin/process/list" }, // process
    ],
  },

  {
    label: "히스토리 관리",
    children: [
      { label: "트레이딩 히스토리", href: "/admin/history/trade" }, //
      { label: "트레이딩 이벤트", href: "/admin/history/trade-event" }, //
    ],
  },

  {
    label: "거래소 관리",
    children: [
      // 5번 요구
      { label: "거래소 목록", href: "/admin/exchanges/list" }, // Exchange
      { label: "마켓 관리", href: "/admin/exchanges/market" }, // ExchangeMarket
      { label: "API 키 / 크리덴셜", href: "/admin/exchanges/credential" }, // ExchangeCredential
    ],
  },

  {
    label: "시스템",
    children: [
      // 6번 요구
      { label: "감사 로그", href: "/admin/system/audit" }, // ApiAuditLog
      { label: "알림 로그", href: "/admin/system/notify" }, // Notification
    ],
  },
];

/* ---------------------- 유틸 ---------------------- */
function normalizePath(s: string) {
  return s.replace(/\/+$/, "") || "/";
}
function isActivePath(pathname: string | null, href?: string): boolean {
  if (!href || !pathname) return false;
  return normalizePath(pathname) === normalizePath(href);
}
function anyChildActive(pathname: string | null, node: NavNode): boolean {
  if (isActivePath(pathname, node.href)) return true;
  if (node.children && node.children.length > 0) {
    for (const c of node.children) {
      if (anyChildActive(pathname, c)) return true;
    }
  }
  return false;
}
function nodeKey(prefix: string[], node: NavNode) {
  return [...prefix, node.label].join(" / ");
}
function depthPaddingClass(depth: number): string {
  if (depth <= 0) return "pl-4";
  if (depth === 1) return "pl-6";
  return "pl-8";
}

/* ---------------------- 하위 컴포넌트 ---------------------- */
function Leaf({
  node,
  active,
  depth = 0,
}: {
  node: NavNode;
  active: boolean;
  depth?: number;
}) {
  const pad = depthPaddingClass(depth);
  return (
    <li>
      <Link
        href={node.href ?? "#"}
        className={[
          "w-full rounded-lg px-3 py-2 text-sm",
          pad,
          active
            ? "bg-primary text-primary-content"
            : "hover:bg-base-200 text-base-content/80",
        ].join(" ")}
        aria-current={active ? "page" : undefined}
      >
        {node.label}
      </Link>
    </li>
  );
}

// 1) NavGroup의 props에 openKeys 추가, open boolean 대신 내부에서 계산
function NavGroup({
  node,
  pathTrail,
  pathname,
  openKeys,
  onToggle,
}: {
  node: NavNode;
  pathTrail: string[];
  pathname: string | null;
  openKeys: Set<string>;
  onToggle: (key: string) => void;
}) {
  const k = nodeKey(pathTrail, node);
  const active = anyChildActive(pathname, node);
  const isOpen = openKeys.has(k);

  return (
    <li className="rounded-lg">
      <button
        type="button"
        onClick={() => onToggle(k)}
        aria-expanded={isOpen}
        className={[
          "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm",
          active
            ? "bg-primary/10 text-base-content"
            : "hover:bg-base-200 text-base-content/80",
        ].join(" ")}
      >
        <span className="font-medium">{node.label}</span>
        <ChevronDownIcon
          aria-hidden="true"
          className={[
            "h-4 w-4 transition-transform",
            isOpen ? "rotate-180" : "rotate-0",
          ].join(" ")}
        />
      </button>

      {isOpen && node.children && (
        <ul className="menu mt-1 space-y-1">
          {node.children.map((child) => {
            const ck = nodeKey([...pathTrail, node.label], child);
            if (child.children && child.children.length > 0) {
              return (
                <NavGroup
                  key={ck}
                  node={child}
                  pathTrail={[...pathTrail, node.label]}
                  pathname={pathname}
                  openKeys={openKeys}
                  onToggle={onToggle}
                />
              );
            }
            return (
              <Leaf
                key={ck}
                node={child}
                active={isActivePath(pathname, child.href)}
                depth={1}
              />
            );
          })}
        </ul>
      )}
    </li>
  );
}

/* ---------------------- 메뉴 루트 ---------------------- */
function AdminSidebarMenu() {
  const pathname = usePathname();

  const defaultOpen = useMemo(() => {
    const open = new Set<string>();
    const dfs = (nodes: NavNode[], trail: string[]) => {
      for (const n of nodes) {
        const k = nodeKey(trail, n);
        if (n.children && n.children.length > 0) {
          if (anyChildActive(pathname, n)) open.add(k);
          dfs(n.children, [...trail, n.label]);
        }
      }
    };
    dfs(navTree, []);
    return open;
  }, [pathname]);

  const [openKeys, setOpenKeys] = useState<Set<string>>(defaultOpen);

  useEffect(() => {
    setOpenKeys(defaultOpen);
  }, [defaultOpen]);

  const anyActive = useMemo(() => {
    const walk = (nodes: NavNode[]): boolean => {
      for (const n of nodes) {
        if (isActivePath(pathname, n.href)) return true;
        if (n.children && walk(n.children)) return true;
      }
      return false;
    };
    return walk(navTree);
  }, [pathname]);

  // 2) 불필요한 opened 제거
  const onToggle = (key: string) => {
    setOpenKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <ul className="menu p-2">
      {navTree.map((node) => {
        const k = nodeKey([], node);
        if (node.children && node.children.length > 0) {
          return (
            <NavGroup
              key={k}
              node={node}
              pathTrail={[]}
              pathname={pathname}
              openKeys={openKeys}
              onToggle={onToggle}
            />
          );
        }
        return (
          <Leaf
            key={k}
            node={node}
            active={
              anyActive
                ? isActivePath(pathname, node.href)
                : node.href === "/admin"
            }
            depth={0}
          />
        );
      })}
    </ul>
  );
}

/* ---------------------- 사이드바 컨테이너 ---------------------- */
/**
 * daisyUI drawer 레이아웃 기반의 사이드바
 * - 외부 레이아웃에서 drawer 토글을 제어하려면 같은 id의 checkbox를 사용하세요.
 */
export default function AdminSidebar() {
  return (
    <aside
      className="card w-64 bg-base-100 p-2"
      data-theme="" // 페이지 전역 테마 상속 (테마 코드와 호환)
    >
      <AdminSidebarMenu />
    </aside>
  );
}
