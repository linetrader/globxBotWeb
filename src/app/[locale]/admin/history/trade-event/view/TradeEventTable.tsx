// src/app/admin/history/trade-event/view/TradeEventTable.tsx
"use client";

import { useMemo, useCallback } from "react";
import type { TradeEventRow } from "../types";

interface TradeEventTableProps {
  loading: boolean;
  error: string | null;
  rows: TradeEventRow[];
  page: number;
  pageSize: number;
  total: number;
  setPage: (page: number) => void;
  refresh: () => void;
}

function TradeEventTable(props: TradeEventTableProps) {
  const { loading, error, rows, page, pageSize, total, setPage, refresh } =
    props;

  const totalPages = useMemo(() => {
    if (pageSize <= 0) {
      return 1;
    }
    const calc = Math.ceil(total / pageSize);
    return calc > 0 ? calc : 1;
  }, [total, pageSize]);

  const goPrev = useCallback(() => {
    if (page > 1) {
      setPage(page - 1);
    }
  }, [page, setPage]);

  const goNext = useCallback(() => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  }, [page, totalPages, setPage]);

  function formatDate(iso: string): string {
    return iso.replace("T", " ").replace("Z", "");
  }

  return (
    <section className="card bg-base-100 shadow-md">
      <div className="card-body p-4 gap-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div className="text-sm text-base-content/70">
            총 {total}개 이벤트
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
            표시할 이벤트가 없습니다.
          </div>
        ) : null}

        {!loading && !error && rows.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table table-xs">
              <thead>
                <tr>
                  <th>type</th>
                  <th>eventId</th>
                  <th>tradeId</th>
                  <th>botId</th>
                  <th>symbol</th>
                  <th>side</th>
                  <th>lev</th>
                  <th>mode</th>
                  <th>qty</th>
                  <th>price</th>
                  <th>notional</th>
                  <th>PnL(usdt)</th>
                  <th>ROI(%)</th>
                  <th>timestamp</th>
                  <th>createdAt</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  return (
                    <tr
                      key={row.id}
                      className="hover:bg-base-200 transition-colors"
                    >
                      <td className="align-top">
                        <div className="badge badge-info">{row.type}</div>
                      </td>

                      <td className="font-mono text-[11px] break-all align-top">
                        {row.id}
                      </td>

                      <td className="font-mono text-[11px] break-all align-top">
                        {row.tradeId}
                      </td>

                      <td className="font-mono text-[11px] break-all align-top">
                        {row.botId}
                      </td>

                      <td className="text-[11px] align-top">{row.symbol}</td>

                      <td className="text-[11px] align-top">{row.side}</td>

                      <td className="text-[11px] align-top">{row.leverage}</td>

                      <td className="text-[11px] align-top">
                        {row.marginMode}
                      </td>

                      <td className="text-[11px] align-top">{row.qty}</td>

                      <td className="text-[11px] align-top">
                        {row.price ?? "-"}
                      </td>

                      <td className="text-[11px] align-top">
                        {row.notionalUsdt ?? "-"}
                      </td>

                      <td className="text-[11px] align-top">
                        {row.realizedPnlUsdt ?? "-"}
                      </td>

                      <td className="text-[11px] align-top">
                        {row.realizedRoiPct ?? "-"}
                      </td>

                      <td className="text-[11px] align-top">
                        {formatDate(row.timestamp)}
                      </td>

                      <td className="text-[11px] align-top">
                        {formatDate(row.createdAt)}
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

export default TradeEventTable;
