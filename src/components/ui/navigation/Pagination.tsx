// src/components/ui/navigation/Pagination.tsx
"use client";

import type { HTMLAttributes } from "react";
import { Button, SelectField } from "@/components/ui";

type Props = {
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (p: number) => void;
  onPageSizeChange: (s: number) => void;
  /** 페이지 크기 옵션 (기본: [10,20,50,100,200]) */
  pageSizeOptions?: number[];
} & Omit<HTMLAttributes<HTMLDivElement>, "onChange">;

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function PaginationBar({
  total,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100, 200],
  className,
  ...rest
}: Props) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const canPrev = page > 1;
  const canNext = page < totalPages;

  const goto = (p: number) => onPageChange(clamp(p, 1, totalPages));

  return (
    <div
      className={["flex items-center justify-between gap-3", className]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      <div className="text-sm text-base-content/70">
        총 {total.toLocaleString()}건 / 페이지 {page} / {totalPages}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => goto(1)}
          disabled={!canPrev}
          aria-label="처음 페이지"
        >
          « 처음
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => goto(page - 1)}
          disabled={!canPrev}
          aria-label="이전 페이지"
        >
          ‹ 이전
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => goto(page + 1)}
          disabled={!canNext}
          aria-label="다음 페이지"
        >
          다음 ›
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => goto(totalPages)}
          disabled={!canNext}
          aria-label="마지막 페이지"
        >
          마지막 »
        </Button>

        <div className="ml-2">
          <SelectField
            name="pageSize"
            label="페이지 크기"
            value={String(pageSize)}
            onChange={(e) => onPageSizeChange(Number(e.currentTarget.value))}
          >
            {pageSizeOptions.map((n) => (
              <option key={n} value={n}>
                {n}/페이지
              </option>
            ))}
          </SelectField>
        </div>
      </div>
    </div>
  );
}

export default PaginationBar;
