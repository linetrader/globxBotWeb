// src/app/(site)/history/view/HistoryTable.tsx
"use client";

import { useMemo, useCallback } from "react";
import type { HistoryRow } from "../types";

interface HistoryTableProps {
  loading: boolean;
  error: string | null;
  rows: HistoryRow[];
  page: number;
  pageSize: number;
  total: number;
  setPage: (page: number) => void;
  refresh: () => void;
}

/**
 * 참고: HistoryRow는 /api/(site)/history 응답 형태와 동일해야 한다.
 * (요청대로 entryQty 표시는 제거)
 */

function HistoryTable(props: HistoryTableProps) {
  const { loading, error, rows, page, pageSize, total, setPage, refresh } =
    props;

  const totalPages = useMemo((): number => {
    if (pageSize <= 0) return 1;
    const calc = Math.ceil(total / pageSize);
    return calc > 0 ? calc : 1;
  }, [total, pageSize]);

  const goPrev = useCallback((): void => {
    if (page > 1) setPage(page - 1);
  }, [page, setPage]);

  const goNext = useCallback((): void => {
    if (page < totalPages) setPage(page + 1);
  }, [page, totalPages, setPage]);

  function formatDate(iso: string | null): string {
    if (!iso) return "-";
    return iso.replace("T", " ").replace("Z", "");
  }

  function renderProfit(raw: string | null) {
    if (!raw) return <span className="text-base-content/50">-</span>;
    const num = Number(raw);
    if (!Number.isFinite(num))
      return <span className="text-base-content/50">-</span>;
    let cls = "text-base-content/70";
    if (num > 0) cls = "text-green-500 font-semibold";
    else if (num < 0) cls = "text-red-500 font-semibold";
    return <span className={cls}>{raw}</span>;
  }

  function renderRoi(raw: string | null | undefined) {
    if (!raw) return <span className="text-base-content/50">-</span>;
    const num = Number(raw);
    if (!Number.isFinite(num))
      return <span className="text-base-content/50">-</span>;
    let cls = "text-base-content/70";
    if (num > 0) cls = "text-green-500 font-semibold";
    else if (num < 0) cls = "text-red-500 font-semibold";
    return (
      <span className={cls}>
        {raw}
        <span className="opacity-70">%</span>
      </span>
    );
  }

  function renderStatusBadge(status: string) {
    const badgeClass =
      status === "OPEN" ? "badge badge-success" : "badge badge-neutral";
    return <div className={badgeClass}>{status}</div>;
  }

  return (
    <section className="card bg-base-100 shadow-md">
      <div className="card-body p-4 gap-4">
        {/* header: count + pagination */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div className="text-sm text-base-content/70">
            총 {total}개 히스토리
          </div>

          <div className="flex items-center gap-2">
            <button
              className="btn btn-xs"
              disabled={page <= 1}
              onClick={goPrev}
            >
              «
            </button>
            <span className="text-sm">
              {page}/{totalPages}
            </span>
            <button
              className="btn btn-xs"
              disabled={page >= totalPages}
              onClick={goNext}
            >
              »
            </button>

            <button className="btn btn-xs btn-outline" onClick={refresh}>
              새로고침
            </button>
          </div>
        </div>

        {/* 상태 표시 */}
        {loading ? (
          <div className="flex items-center gap-2 text-sm">
            <span className="loading loading-spinner loading-sm" />
            <span>로딩 중…</span>
          </div>
        ) : null}

        {error ? (
          <div className="alert alert-error text-sm">
            <span>에러: {error}</span>
          </div>
        ) : null}

        {!loading && !error && rows.length === 0 ? (
          <div className="text-sm text-base-content/70">
            표시할 거래 내역이 없습니다.
          </div>
        ) : null}

        {/* 모바일 카드 뷰 (md:hidden) */}
        {!loading && !error && rows.length > 0 ? (
          <div className="grid grid-cols-1 gap-2 md:hidden">
            {rows.map((row, idx) => {
              return (
                <div
                  key={idx}
                  className="border border-base-300 rounded-box p-3 flex flex-col gap-2"
                >
                  <div className="flex flex-row justify-between items-start">
                    <div className="text-sm font-semibold">{row.botName}</div>
                    {renderStatusBadge(row.status)}
                  </div>

                  <div className="text-[12px] flex flex-wrap gap-x-4 gap-y-1">
                    <div>
                      거래소:{" "}
                      <span className="font-semibold">{row.exchange}</span>
                    </div>
                    <div>
                      심볼: <span className="font-semibold">{row.symbol}</span>
                    </div>
                  </div>

                  <div className="text-[12px] flex flex-wrap gap-x-4 gap-y-1">
                    <div>
                      방향: <span className="font-semibold">{row.side}</span>
                    </div>
                    <div>
                      레버리지:{" "}
                      <span className="font-semibold">{row.leverage}</span>
                    </div>
                  </div>

                  <div className="text-[12px] flex flex-col gap-y-1">
                    <div>
                      진입USDT:{" "}
                      <span className="font-semibold">
                        {row.entryCostUsdt ?? "-"}
                      </span>
                    </div>
                    <div>
                      진입가격:{" "}
                      <span className="font-semibold">
                        {row.entryPrice ?? "-"}
                      </span>
                    </div>
                  </div>

                  <div className="text-[12px] flex flex-wrap gap-x-4 gap-y-1">
                    <div>
                      수익:{" "}
                      <span className="font-semibold">
                        {renderProfit(row.profitUsdt)}
                      </span>
                    </div>
                    <div>
                      ROI:{" "}
                      <span className="font-semibold">
                        {renderRoi(row.realizedRoiPct)}
                      </span>
                    </div>
                  </div>

                  <div className="text-[11px] text-base-content/60 flex flex-col gap-1">
                    <div>진입시간: {formatDate(row.openedAt)}</div>
                    <div>청산시간: {formatDate(row.closedAt)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}

        {/* 데스크탑 테이블 뷰 (hidden md:block) */}
        {!loading && !error && rows.length > 0 ? (
          <div className="overflow-x-auto hidden md:block">
            <table className="table table-xs">
              <thead>
                <tr>
                  <th>상태</th>
                  <th>봇</th>
                  <th>거래소</th>
                  <th>심볼</th>
                  <th>방향</th>
                  <th>레버리지</th>
                  <th>진입USDT</th>
                  <th>진입가격</th>
                  <th>수익</th>
                  <th>ROI</th>
                  <th>진입시간</th>
                  <th>청산시간</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => {
                  return (
                    <tr
                      key={idx}
                      className="hover:bg-base-200 transition-colors"
                    >
                      <td className="align-top">
                        {renderStatusBadge(row.status)}
                      </td>
                      <td className="text-[11px] align-top">{row.botName}</td>
                      <td className="text-[11px] align-top">{row.exchange}</td>
                      <td className="text-[11px] align-top">{row.symbol}</td>
                      <td className="text-[11px] align-top">{row.side}</td>
                      <td className="text-[11px] align-top">{row.leverage}</td>
                      <td className="text-[11px] align-top">
                        {row.entryCostUsdt ?? "-"}
                      </td>
                      <td className="text-[11px] align-top">
                        {row.entryPrice ?? "-"}
                      </td>
                      <td className="text-[11px] align-top">
                        {renderProfit(row.profitUsdt)}
                      </td>
                      <td className="text-[11px] align-top">
                        {renderRoi(row.realizedRoiPct)}
                      </td>
                      <td className="text-[11px] align-top">
                        {formatDate(row.openedAt)}
                      </td>
                      <td className="text-[11px] align-top">
                        {formatDate(row.closedAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default HistoryTable;
