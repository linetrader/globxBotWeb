// src/components/ui/navigation/Sidebar.tsx
"use client";

import type { CSSProperties, ReactNode } from "react";

export type SidebarProps = {
  /** 메뉴 영역(리스트 또는 커스텀 콘텐츠) */
  menu: ReactNode;
  /** 사이드바 상단 고정 헤더(선택) */
  header?: ReactNode;
  /** 사이드바 하단 고정 푸터(선택) */
  footer?: ReactNode;
  /** drawer input id (토글과 매칭), 기본: "app-drawer" */
  id?: string;
  /** 사이드바 폭(px 또는 CSS 길이), 기본: 320 */
  width?: number | string;
  /** true면 <ul className="menu">로 감싸고, false면 raw 렌더링 */
  wrapWithList?: boolean;
  /** 본문 콘텐츠(페이지 내용) */
  children?: ReactNode;
};

export function Sidebar({
  menu,
  header,
  footer,
  id = "app-drawer",
  width = 320,
  wrapWithList = true,
  children,
}: SidebarProps) {
  const w: CSSProperties["width"] =
    typeof width === "number" ? `${width}px` : width;

  return (
    <div className="drawer lg:drawer-open">
      <input id={id} type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">
        {/* 페이지 본문 */}
        {children}
      </div>

      <div className="drawer-side">
        <label
          htmlFor={id}
          aria-label="close sidebar"
          className="drawer-overlay"
        />
        <aside
          className="min-h-full bg-base-100 border-r border-base-300 flex flex-col"
          style={{ width: w }}
          aria-label="Sidebar"
        >
          {header ? (
            <div className="px-4 py-3 border-b border-base-300">{header}</div>
          ) : null}

          <div className="flex-1 overflow-y-auto">
            {wrapWithList ? (
              <ul className="menu p-4">{menu}</ul>
            ) : (
              <div className="p-4">{menu}</div>
            )}
          </div>

          {footer ? (
            <div className="px-4 py-3 border-t border-base-300">{footer}</div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

/** 어디서든 사이드바 열기/닫기용 토글 버튼 */
export function SidebarToggle({
  id = "app-drawer",
  label = "Open sidebar",
  className,
}: {
  id?: string;
  label?: string;
  className?: string;
}) {
  return (
    <label htmlFor={id} className={className} aria-label={label} role="button">
      {/* 이 라벨을 클릭하면 해당 drawer가 열림 */}
      {label}
    </label>
  );
}

export default Sidebar;
