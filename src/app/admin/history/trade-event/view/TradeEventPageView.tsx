// src/app/admin/history/trade-event/view/TradeEventPageView.tsx
"use client";

import { useCallback } from "react";
import type { UseTradeEventListReturn } from "../types";
import TradeEventTable from "./TradeEventTable";

// 빈 interface 대신 type alias 사용
type TradeEventPageViewProps = UseTradeEventListReturn;

function TradeEventPageView(props: TradeEventPageViewProps) {
  const {
    loading,
    error,
    rows,
    page,
    pageSize,
    total,
    setPage,
    botFilter,
    setBotFilter,
    tradeFilter,
    setTradeFilter,
    refresh,
  } = props;

  const onBotIdChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setBotFilter(e.target.value);
    },
    [setBotFilter]
  );

  const onTradeIdChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTradeFilter(e.target.value);
    },
    [setTradeFilter]
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
              <h2 className="card-title text-lg font-bold">Trade Events</h2>
              <p className="text-sm text-base-content/70">
                체결, 부분 청산, 최종 청산 등 이벤트 로그
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-2 items-start md:items-end">
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-sm font-semibold">
                    botId
                  </span>
                </label>
                <input
                  type="text"
                  className="input input-bordered input-sm"
                  value={botFilter}
                  onChange={onBotIdChange}
                  placeholder="botId"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text text-sm font-semibold">
                    tradeId
                  </span>
                </label>
                <input
                  type="text"
                  className="input input-bordered input-sm"
                  value={tradeFilter}
                  onChange={onTradeIdChange}
                  placeholder="tradeId"
                />
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

      <TradeEventTable
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

export default TradeEventPageView;
