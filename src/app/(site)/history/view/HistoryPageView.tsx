// src/app/(site)/history/view/HistoryPageView.tsx
"use client";

import { useCallback } from "react";
import type { UseHistoryListReturn } from "../types";
import HistoryTable from "./HistoryTable";

// 인터페이스 대신 type alias로 선언
type HistoryPageViewProps = UseHistoryListReturn;

function HistoryPageView(props: HistoryPageViewProps) {
  const {
    loading,
    error,
    rows,
    page,
    pageSize,
    total,
    setPage,

    botIdFilter,
    setBotIdFilter,

    symbolFilter,
    setSymbolFilter,

    botOptions,
    symbolOptions,

    refresh,
  } = props;

  // 봇 셀렉트 변경
  const onBotIdChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setBotIdFilter(e.target.value);
    },
    [setBotIdFilter]
  );

  // 심볼 셀렉트 변경
  const onSymbolChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSymbolFilter(e.target.value);
    },
    [setSymbolFilter]
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
              <h2 className="card-title text-lg font-bold">내 거래 히스토리</h2>
              <p className="text-sm text-base-content/70">
                나의 봇 기준으로 필터된 체결/청산 기록
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-2 items-start md:items-end w-full md:w-auto">
              {/* ▼ 봇 선택 셀렉트 */}
              <div className="form-control w-full md:w-auto">
                <label className="label">
                  <span className="label-text text-sm font-semibold">봇</span>
                </label>
                <select
                  className="select select-bordered select-sm w-full md:w-40"
                  value={botIdFilter}
                  onChange={onBotIdChange}
                >
                  <option value="">봇 선택</option>
                  {botOptions.map((bot) => (
                    <option key={bot.botId} value={bot.botId}>
                      {bot.botName}
                    </option>
                  ))}
                </select>
              </div>

              {/* ▼ 심볼 선택 셀렉트 */}
              <div className="form-control w-full md:w-auto">
                <label className="label">
                  <span className="label-text text-sm font-semibold">심볼</span>
                </label>
                <select
                  className="select select-bordered select-sm w-full md:w-32"
                  value={symbolFilter}
                  onChange={onSymbolChange}
                >
                  <option value="">심볼 선택</option>
                  {symbolOptions.map((sym) => (
                    <option key={sym} value={sym}>
                      {sym}
                    </option>
                  ))}
                </select>
              </div>

              <button
                className="btn btn-sm btn-outline w-full md:w-auto"
                onClick={onApplyClick}
              >
                필터 적용
              </button>

              <button
                className="btn btn-sm btn-primary w-full md:w-auto"
                onClick={refresh}
              >
                새로고침
              </button>
            </div>
          </div>
        </div>
      </section>

      <HistoryTable
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

export default HistoryPageView;
