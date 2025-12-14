// src/app/admin/history/trade/view/TradePageView.tsx
"use client";

import { useCallback } from "react";
import type { UseTradeListReturn, TradeStatusFilter } from "../types";
import TradeTable from "./TradeTable";

// 빈 interface 대신 type alias
type TradePageViewProps = UseTradeListReturn;

function TradePageView(props: TradePageViewProps) {
  const {
    loading,
    error,
    rows,
    page,
    pageSize,
    total,
    setPage,
    statusFilter,
    setStatusFilter,
    refresh,
  } = props;

  const onFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const v = e.target.value as TradeStatusFilter;
      setStatusFilter(v);
    },
    [setStatusFilter]
  );

  const onApplyClick = useCallback(() => {
    refresh();
  }, [refresh]);

  return (
    <main className="p-4 flex flex-col gap-4">
      <section className="card bg-base-100 shadow-md">
        <div className="card-body flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h2 className="card-title text-lg font-bold">Trade History</h2>
              <p className="text-sm text-base-content/70">
                트레이드(포지션) 오픈/클로즈 정보
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-2 items-start md:items-end">
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-sm font-semibold">
                    상태 필터
                  </span>
                </label>
                <select
                  className="select select-bordered select-sm"
                  value={statusFilter}
                  onChange={onFilterChange}
                >
                  <option value="ALL">ALL</option>
                  <option value="OPEN">OPEN</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>

              <button className="btn btn-sm btn-outline" onClick={onApplyClick}>
                필터 적용
              </button>

              <button className="btn btn-sm btn-primary" onClick={refresh}>
                새로고침
              </button>
            </div>
          </div>
        </div>
      </section>

      <TradeTable
        loading={loading}
        error={error}
        rows={rows}
        page={page}
        pageSize={pageSize}
        total={total}
        setPage={setPage}
        refresh={refresh}
      />
    </main>
  );
}

export default TradePageView;
