// src/components/ui/Drawer.tsx
"use client";

import type { ReactNode } from "react";

type DrawerProps = {
  open: boolean;
  onClose: () => void;
  side?: "left" | "right";
  width?: string; // e.g. "min(54vw, 260px)"
  header?: ReactNode;
  footer?: ReactNode;
  children: ReactNode; // scroll area
};

export function Drawer({
  open,
  onClose,
  side = "right",
  width = "min(54vw, 260px)",
  header,
  footer,
  children,
}: DrawerProps) {
  const endClass = side === "right" ? "drawer-end" : "";
  const openClass = open ? "drawer-open" : "";

  return (
    <div
      className={`drawer ${endClass} ${openClass} z-[100]`}
      aria-labelledby="drawer-title"
    >
      {/* 🔑 제어형 토글: checked={open} 로 열림 상태를 daisyUI에 전달 */}
      <input
        type="checkbox"
        className="drawer-toggle"
        checked={open}
        onChange={(e) => {
          // 체크 해제(오버레이 클릭 등) → 닫기
          if (!e.target.checked) onClose();
        }}
        aria-hidden="true"
      />

      {/* 페이지 컨텐츠 (여기선 사용 안함) */}
      <div className="drawer-content" />

      {/* 사이드 패널 영역 */}
      <div className="drawer-side">
        {/* 오버레이: 클릭 시 닫기 */}
        <label className="drawer-overlay" onClick={onClose} aria-label="닫기" />

        <aside
          role="dialog"
          aria-modal="true"
          className="menu bg-base-100 text-base-content min-h-full border-base-300 shadow-2xl"
          style={{ width }}
        >
          {header ? (
            <div className="flex items-center justify-between border-b border-base-300 px-4 py-3">
              {header}
              <button
                onClick={onClose}
                className="btn btn-ghost btn-square btn-sm"
                aria-label="닫기"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
                  <path
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    d="M6 6l12 12M18 6L6 18"
                  />
                </svg>
              </button>
            </div>
          ) : null}

          {/* 스크롤 영역 */}
          <nav className="px-2 pb-[env(safe-area-inset-bottom)] flex-1 overflow-y-auto">
            {children}
          </nav>

          {footer ? (
            <div className="border-t border-base-300 p-2">{footer}</div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

export default Drawer;
