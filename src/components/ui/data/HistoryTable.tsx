// src/components/ui/data/HistoryTable.tsx
"use client";

import { useMemo, type ReactNode, type MouseEvent } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";

export type HistoryTableRow = {
  id: string;
  date: string | Date; // ISO 문자열 또는 Date
  amount: number;
  note?: string;
  meta?: ReactNode; // 우측 뱃지/상태 등 선택
};

export type HistoryTableProps = {
  rows: HistoryTableRow[];
  /** 데이터가 없을 때 표시할 문구 */
  emptyLabel?: string;
  /** 테이블 헤더(기본: ["메모", "일시", "금액"]) */
  head?: ReactNode[];
  /** 아이콘 슬롯(기본: "₿") */
  renderIcon?: (row: HistoryTableRow) => ReactNode;
  /** 금액 포맷 사용자 지정 */
  formatAmount?: (n: number) => ReactNode;
  /** 날짜 포맷 사용자 지정 */
  formatDate?: (d: string | Date) => ReactNode;
  /** 래퍼 클래스 */
  className?: string;
  /** 행 클릭 핸들러 */
  onRowClick?: (
    row: HistoryTableRow,
    e: MouseEvent<HTMLTableRowElement>
  ) => void;

  /** -------------------- 확장 옵션 -------------------- */
  /** Intl NumberFormat locale 지정(기본: 브라우저) */
  locale?: string;
  /** 소수 자릿수(기본: 6) */
  maximumFractionDigits?: number;
  /** 통화 코드(예: "KRW" | "USD"); 지정 시 통화 형식 사용 */
  currency?: string;
  /** 행 밀도 축소 */
  dense?: boolean;
  /** zebra 줄무늬 */
  zebra?: boolean;
  /** 헤더 고정 */
  stickyHeader?: boolean;
  /** 로딩 스켈레톤 표시 */
  loading?: boolean;
  /** 금액 부호별 색상 클래스 지정(기본: success / error / muted) */
  amountColorClasses?: {
    positive?: string;
    negative?: string;
    zero?: string;
  };
  /** 행 클래스 커스터마이즈 */
  getRowClassName?: (row: HistoryTableRow) => string | undefined;
  /** 빈 상태 아이콘(선택) */
  emptyIcon?: ReactNode;
};

export function HistoryTable({
  rows,
  emptyLabel = "내역이 없습니다.",
  head = ["메모", "일시", "금액"],
  renderIcon,
  formatAmount,
  formatDate,
  className,
  onRowClick,

  // 확장 옵션
  locale,
  maximumFractionDigits = 6,
  currency,
  dense,
  zebra,
  stickyHeader,
  loading,
  amountColorClasses,
  getRowClassName,
  emptyIcon,
}: HistoryTableProps) {
  // ---------- 포맷터 ----------
  const numberFmt = useMemo(() => {
    if (currency) {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        maximumFractionDigits,
      });
    }
    return new Intl.NumberFormat(locale, { maximumFractionDigits });
  }, [currency, locale, maximumFractionDigits]);

  const defaultFormatAmount = (n: number) => numberFmt.format(n);

  const defaultFormatDate = (d: string | Date) => {
    const date = typeof d === "string" ? new Date(d) : d;
    if (Number.isNaN(date.getTime())) return String(d);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const HH = String(date.getHours()).padStart(2, "0");
    const MM = String(date.getMinutes()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd} ${HH}:${MM}`;
  };

  // ---------- 스타일 ----------
  const wrapperCls = "overflow-x-auto" + (className ? ` ${className}` : "");
  const tableCls =
    "table" +
    (zebra ? " table-zebra" : "") +
    (dense ? " [&_td]:py-2 [&_th]:py-2" : "");

  const headerCls = stickyHeader ? "sticky top-0 z-10 bg-base-200" : undefined;

  const posCls = amountColorClasses?.positive ?? "text-success";
  const negCls = amountColorClasses?.negative ?? "text-error";
  const zeroCls = amountColorClasses?.zero ?? "text-base-content/70";

  // ---------- 빈 상태 ----------
  if (!loading && rows.length === 0) {
    return (
      <div
        className={
          "rounded-xl border border-base-300 bg-base-100 p-6 text-center text-sm text-base-content/70" +
          (className ? ` ${className}` : "")
        }
        role="status"
        aria-live="polite"
      >
        <div className="flex items-center justify-center gap-2">
          {emptyIcon ? (
            <span aria-hidden className="text-base">
              {emptyIcon}
            </span>
          ) : null}
          <span>{emptyLabel}</span>
        </div>
      </div>
    );
  }

  // ---------- 로딩 스켈레톤 ----------
  const skeletonRows = loading && rows.length === 0 ? 6 : 0;

  // ✅ row 인자 제거 → 불필요 경고 제거
  const onRowKeyDown = (e: ReactKeyboardEvent<HTMLTableRowElement>) => {
    if (!onRowClick) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault(); // Space 스크롤 방지
      e.currentTarget.click(); // 실제 클릭 발생 → onRowClick(MouseEvent) 경로 재사용
    }
  };

  return (
    <div className={wrapperCls}>
      <table className={tableCls}>
        <thead>
          <tr className={headerCls}>
            {head.map((h, i) => (
              <th key={i}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="[&_td:last-child]:text-right">
          {/* 로딩 스켈레톤 */}
          {skeletonRows > 0 &&
            Array.from({ length: skeletonRows }).map((_, i) => (
              <tr key={`sk-${i}`} className="animate-pulse">
                <td>
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="grid h-7 w-7 place-items-center rounded-md border border-base-300 bg-base-200" />
                    <span className="h-3 w-40 rounded bg-base-200" />
                  </div>
                </td>
                <td>
                  <span className="inline-block h-3 w-28 rounded bg-base-200" />
                </td>
                <td>
                  <span className="inline-block h-3 w-16 rounded bg-base-200" />
                </td>
              </tr>
            ))}

          {/* 실제 데이터 */}
          {rows.map((r) => {
            const clickable = Boolean(onRowClick);
            const rowCls =
              (clickable
                ? "cursor-pointer hover:bg-base-200/40 focus:bg-base-200/50 outline-none"
                : "") + (getRowClassName ? ` ${getRowClassName(r) ?? ""}` : "");
            const amountCls =
              r.amount > 0 ? posCls : r.amount < 0 ? negCls : zeroCls;

            return (
              <tr
                key={r.id}
                className={rowCls}
                onClick={onRowClick ? (e) => onRowClick(r, e) : undefined}
                onKeyDown={onRowKeyDown}
                tabIndex={clickable ? 0 : -1}
                aria-label={r.note ? `행: ${r.note}` : undefined}
              >
                {/* 메모 + 아이콘 */}
                <td>
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="grid h-7 w-7 place-items-center rounded-md border border-base-300 bg-base-200 text-xs text-base-content/80">
                      {renderIcon ? renderIcon(r) : "₿"}
                    </div>
                    <span className="truncate">{r.note ?? "수익 적립"}</span>
                    {r.meta ? (
                      <span className="ml-1 shrink-0">{r.meta}</span>
                    ) : null}
                  </div>
                </td>

                {/* 날짜 */}
                <td className="whitespace-nowrap text-xs text-base-content/70">
                  {formatDate ? formatDate(r.date) : defaultFormatDate(r.date)}
                </td>

                {/* 금액 */}
                <td className={`font-medium ${amountCls}`}>
                  {formatAmount
                    ? formatAmount(r.amount)
                    : defaultFormatAmount(r.amount)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default HistoryTable;
