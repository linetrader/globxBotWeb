// src/components/ui/layout/AssetCard.tsx
"use client";

import type { ReactNode, MouseEvent, KeyboardEvent } from "react";

/** 간단한 class 병합 */
function cx(...v: Array<string | false | null | undefined>) {
  return v.filter(Boolean).join(" ");
}

/** 금액 포맷(외부 의존성 없이 Intl 사용) */
function defaultFormatAmount(n: number, maximumFractionDigits = 6) {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits }).format(n);
}

export type AssetCardAccent =
  | "primary"
  | "secondary"
  | "accent"
  | "info"
  | "success"
  | "warning"
  | "error";

export type AssetCardProps = {
  /** 토큰 코드 (예: USDT) */
  code: string;
  /** 토큰 이름 (예: 테더) */
  name?: string;
  /** 보유 수량/금액 (없거나 계산 불가일 수 있음) */
  amount?: number | null;
  /** 값이 없을 때 표시할 대체 텍스트 */
  fallback?: ReactNode;
  /** 배지/강조 색상 */
  accent?: AssetCardAccent;
  /** 컴팩트 모드 (간격 축소) */
  compact?: boolean;
  /** 로딩 스켈레톤 표시 */
  loading?: boolean;
  /** 클릭 동작 */
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
  /** 외형 커스터마이즈 */
  className?: string;

  /** 아이콘 커스터마이즈 (기본: 코드 앞 2글자) */
  renderIcon?: (p: { code: string }) => ReactNode;
  /** 금액 포맷 커스터마이즈 */
  formatAmount?: (n: number) => ReactNode;
  /** 우측/하단 메타(뱃지, 상태) 커스터마이즈 */
  metaRight?: ReactNode;
  metaBottom?: ReactNode;

  /** 소수 자릿수 (기본 6) */
  maximumFractionDigits?: number;
};

/** 외부 의존성 없는 확장형 AssetCard */
export default function AssetCard({
  code,
  name,
  amount,
  fallback = "–",
  accent = "primary",
  compact,
  loading,
  onClick,
  className,
  renderIcon,
  formatAmount,
  metaRight,
  metaBottom,
  maximumFractionDigits = 6,
}: AssetCardProps) {
  const initials = code.slice(0, 2).toUpperCase();
  const pad = compact ? "p-3" : "p-4";

  const isClickable = typeof onClick === "function";

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!isClickable) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      // @ts-expect-error: MouseEvent 아님 — 키보드 활성화 시 click 의미만 전달
      onClick?.(e);
    }
  };

  const amountNode =
    typeof amount === "number"
      ? formatAmount
        ? formatAmount(amount)
        : defaultFormatAmount(amount, maximumFractionDigits)
      : fallback;

  return (
    <div
      className={cx(
        "card bg-base-100 border border-base-300",
        isClickable && "cursor-pointer hover:bg-base-200/40 transition-colors",
        className
      )}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={isClickable ? "button" : "group"}
      tabIndex={isClickable ? 0 : -1}
      aria-label={`${name ?? code} 잔고 카드`}
    >
      {/* 상단 진행바 형태의 로딩 표시 (옵션) */}
      {loading ? (
        <div className="h-1 w-full bg-base-300">
          <div className="h-1 w-1/3 animate-[progress_1.2s_ease-in-out_infinite] bg-primary" />
        </div>
      ) : null}

      <div className={cx("card-body", pad)}>
        <div className="flex items-center justify-between">
          {/* 좌측: 이름/코드 */}
          <div className="min-w-0">
            <p className="text-xs text-base-content/60 truncate">
              {name ?? code}
            </p>
            <p className="text-base font-semibold text-base-content truncate">
              {code}
            </p>
          </div>

          {/* 우측: 토큰 아이콘 */}
          <div className="grid h-10 w-10 place-items-center rounded-lg border border-base-300 bg-base-200 shrink-0">
            <span className="text-sm font-medium text-base-content/80">
              {renderIcon ? renderIcon({ code }) : initials}
            </span>
          </div>
        </div>

        {/* 금액 */}
        <p
          className={cx(
            "font-semibold text-base-content",
            compact ? "mt-2 text-base" : "mt-3 text-lg"
          )}
          aria-live={loading ? "polite" : undefined}
        >
          {amountNode}
        </p>

        {/* 하단 메타/배지 영역 */}
        <div
          className={cx(
            "mt-2 flex items-center justify-between gap-2",
            compact && "mt-1"
          )}
        >
          <span className={cx("badge badge-outline", `badge-${accent}`)}>
            {code}
          </span>
          {metaRight ?? null}
        </div>

        {metaBottom ? (
          <div className="mt-2 text-xs text-base-content/70">{metaBottom}</div>
        ) : null}
      </div>
    </div>
  );
}

/* Tailwind keyframes (선택)
@keyframes progress {
  0%   { transform: translateX(-100%); width: 30%; }
  50%  { transform: translateX(50%);  width: 40%; }
  100% { transform: translateX(200%); width: 30%; }
}
*/
