"use client";

import { useCallback } from "react";
import type { UseHistoryListReturn } from "../types";
import HistoryTable from "./HistoryTable";
import { useTranslations } from "next-intl";
import {
  ClockIcon,
  FunnelIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

type HistoryPageViewProps = UseHistoryListReturn;

function HistoryPageView(props: HistoryPageViewProps) {
  const t = useTranslations("history");

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

  const onBotIdChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setBotIdFilter(e.target.value);
    },
    [setBotIdFilter]
  );

  const onSymbolChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSymbolFilter(e.target.value);
    },
    [setSymbolFilter]
  );

  // [수정] 공통 스타일 (라이트/다크 분기)
  const selectClass =
    "select select-bordered select-sm w-full transition-colors h-10 " +
    "bg-white border-gray-300 text-gray-900 focus:border-[#06b6d4] focus:outline-none " +
    "[:root[data-theme=dark]_&]:bg-[#0B1222] [:root[data-theme=dark]_&]:border-gray-700 [:root[data-theme=dark]_&]:text-gray-200";

  const labelClass =
    "label-text text-xs font-medium mb-1 block " +
    "text-gray-600 [:root[data-theme=dark]_&]:text-gray-400";

  return (
    <main className="max-w-7xl mx-auto space-y-6">
      {/* 헤더 섹션 */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-[#06b6d4]/10 rounded-lg">
          <ClockIcon className="h-8 w-8 text-[#06b6d4]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 [:root[data-theme=dark]_&]:text-white">
            {t("page.title")}
          </h1>
          <p className="text-sm text-gray-500 [:root[data-theme=dark]_&]:text-gray-400">
            {t("page.subtitle")}
          </p>
        </div>
      </div>

      {/* 필터 섹션 */}
      <section className="rounded-2xl shadow-xl p-5 border transition-colors bg-white border-gray-200 [:root[data-theme=dark]_&]:bg-[#131B2D] [:root[data-theme=dark]_&]:border-gray-800">
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 봇 필터 */}
            <div>
              <label className={labelClass}>{t("filter.bot")}</label>
              <div className="relative">
                <select
                  className={selectClass}
                  value={botIdFilter}
                  onChange={onBotIdChange}
                >
                  <option value="">{t("filter.allBots")}</option>
                  {botOptions.map((bot) => (
                    <option key={bot.botId} value={bot.botId}>
                      {bot.botName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 심볼 필터 */}
            <div>
              <label className={labelClass}>{t("filter.symbol")}</label>
              <div className="relative">
                <select
                  className={selectClass}
                  value={symbolFilter}
                  onChange={onSymbolChange}
                >
                  <option value="">{t("filter.allSymbols")}</option>
                  {symbolOptions.map((sym) => (
                    <option key={sym} value={sym}>
                      {sym}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              className="btn btn-primary bg-[#06b6d4] hover:bg-[#0891b2] border-none text-white btn-sm h-10 px-6 w-full md:w-auto gap-2 shadow-lg shadow-cyan-500/20 [:root[data-theme=dark]_&]:shadow-cyan-900/20"
              onClick={refresh}
            >
              <FunnelIcon className="h-4 w-4" />
              {t("action.apply")}
            </button>
            <button
              className="btn btn-ghost btn-sm h-10 w-full md:w-auto border transition-colors border-gray-300 text-gray-500 hover:bg-gray-100 [:root[data-theme=dark]_&]:border-gray-700 [:root[data-theme=dark]_&]:text-gray-400 [:root[data-theme=dark]_&]:hover:text-white [:root[data-theme=dark]_&]:hover:border-gray-500"
              onClick={refresh}
              title={t("action.refresh")}
            >
              <ArrowPathIcon className="h-5 w-5" />
            </button>
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
