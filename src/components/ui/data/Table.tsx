// src/components/ui/data/Table.tsx
"use client";

import { useEffect, useMemo, useRef } from "react";
import type { ReactNode, MouseEvent } from "react";

export type TableAlign = "left" | "center" | "right";

export type TableProps = {
  head: ReactNode[];
  rows: ReactNode[][];
  /** 바깥 wrapper class */
  className?: string;
  /** table element class */
  tableClassName?: string;
  /** 헤더 고정 */
  stickyHeader?: boolean;
  /** 줄무늬 */
  zebra?: boolean;
  /** 조밀 모드 */
  dense?: boolean;
  /** 각 컬럼 정렬 (없으면 left) */
  colAlign?: TableAlign[];
  /** 행 클릭 (선택) */
  onRowClick?: (rowIndex: number, e: MouseEvent<HTMLTableRowElement>) => void;

  /** ✅ 선택(체크박스) 옵션 */
  selectable?: boolean;
  /** 선택된 행 인덱스 집합 */
  selectedRowIndexes?: Set<number>;
  /** 개별 행 토글 */
  onToggleRow?: (rowIndex: number, checked: boolean) => void;
  /** 전체 토글 */
  onToggleAll?: (checked: boolean) => void;
  /** 선택열 헤더 라벨(툴팁/접근성에만 사용) */
  selectHeaderLabel?: ReactNode;
};

export function Table({
  head,
  rows,
  className,
  tableClassName,
  stickyHeader,
  zebra,
  dense,
  colAlign,
  onRowClick,
  selectable = false,
  selectedRowIndexes,
  onToggleRow,
  onToggleAll,
  selectHeaderLabel = "",
}: TableProps) {
  const wrapperCls = ["overflow-x-auto", className].filter(Boolean).join(" ");
  const tableCls = [
    "table min-w-full text-sm",
    zebra ? "table-zebra" : "",
    dense ? "[&_td]:py-2 [&_th]:py-2" : "",
    tableClassName ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  const headerRowCls = [
    "border-b bg-muted/50 text-left",
    stickyHeader ? "sticky top-0 z-10" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const alignCls = (idx: number) => {
    const a = colAlign?.[idx] ?? "left";
    return a === "right"
      ? "text-right"
      : a === "center"
        ? "text-center"
        : "text-left";
  };

  // ✅ 헤더는 체크박스 열을 추가하지 않는다(중복 방지)
  const effectiveHead: ReactNode[] = useMemo(() => head, [head]);

  // indeterminate 제어를 위한 헤더 체크박스 ref
  const headerCbRef = useRef<HTMLInputElement | null>(null);
  const allSelected =
    selectable &&
    rows.length > 0 &&
    (selectedRowIndexes?.size ?? 0) === rows.length;
  const someSelected =
    selectable &&
    (selectedRowIndexes?.size ?? 0) > 0 &&
    (selectedRowIndexes?.size ?? 0) < rows.length;

  useEffect(() => {
    if (!selectable) return;
    if (headerCbRef.current) {
      headerCbRef.current.indeterminate = Boolean(someSelected && !allSelected);
    }
  }, [selectable, someSelected, allSelected]);

  // ✅ 바디는 체크박스 셀을 맨 앞에 한 칸 추가
  const effectiveRows: ReactNode[][] = useMemo(() => {
    if (!selectable) return rows;
    return rows.map((r, i) => {
      const checked = selectedRowIndexes?.has(i) ?? false;
      const cb = (
        <input
          type="checkbox"
          aria-label="select-row"
          checked={checked}
          onChange={(e) => onToggleRow?.(i, e.target.checked)}
          className="checkbox"
        />
      );
      return [cb, ...r];
    });
  }, [rows, selectable, selectedRowIndexes, onToggleRow]);

  // 접근성/툴팁용 라벨(문자열일 때만 title/aria-label 부여)
  const headerCbTitle =
    typeof selectHeaderLabel === "string" ? selectHeaderLabel : undefined;

  return (
    <div className={wrapperCls}>
      <table className={tableCls} role="table">
        <thead>
          <tr className={headerRowCls}>
            {selectable && (
              // ✅ 체크박스 헤더는 1번만 렌더 + 고정폭
              <th className="px-3 py-2 text-center w-10">
                <input
                  ref={headerCbRef}
                  type="checkbox"
                  aria-label={headerCbTitle ?? "select-all"}
                  title={headerCbTitle}
                  checked={Boolean(allSelected)}
                  onChange={(e) => onToggleAll?.(e.target.checked)}
                  className="checkbox"
                />
              </th>
            )}
            {effectiveHead.map((h, i) => (
              <th key={i} className={`px-3 py-2 ${alignCls(i)}`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {effectiveRows.map((r, i) => (
            <tr
              key={i}
              className={
                onRowClick
                  ? "border-b cursor-pointer hover:bg-base-200/40"
                  : "border-b"
              }
              onClick={onRowClick ? (e) => onRowClick(i, e) : undefined}
            >
              {r.map((c, j) => (
                <td
                  key={j}
                  className={`px-3 py-2 ${
                    selectable
                      ? j === 0
                        ? "text-center w-10"
                        : alignCls(j - 1)
                      : alignCls(j)
                  }`}
                >
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
