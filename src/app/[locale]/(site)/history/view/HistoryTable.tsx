"use client";

import { useMemo, useCallback } from "react";
import type { HistoryRow } from "../types";
import { useTranslations } from "next-intl";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

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

// 🚀 [추가] 숫자를 받아 소수점 2자리 문자열로 포맷하는 공통 함수
function formatNumber(raw: string | null, decimals: number = 2): string | null {
  if (raw === null || raw.trim() === "") return null;
  const num = Number(raw);
  if (!Number.isFinite(num)) return null;

  // 소수점 2자리로 고정하고, 쉼표를 찍어 로케일에 맞게 포맷
  return num.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function HistoryTable(props: HistoryTableProps) {
  const t = useTranslations("history");
  const { loading, error, rows, page, pageSize, total, setPage } = props;

  const totalPages = useMemo(() => {
    if (pageSize <= 0) return 1;
    const calc = Math.ceil(total / pageSize);
    return calc > 0 ? calc : 1;
  }, [total, pageSize]);

  const goPrev = useCallback(() => {
    if (page > 1) setPage(page - 1);
  }, [page, setPage]);

  const goNext = useCallback(() => {
    if (page < totalPages) setPage(page + 1);
  }, [page, totalPages, setPage]);

  function formatDate(iso: string | null): string {
    if (!iso) return "-";
    // T와 Z 제거 후 16자리(YYYY-MM-DD HH:MM)로 자름
    return iso.replace("T", " ").replace("Z", "").slice(0, 16);
  }

  // 🚀 [수정] 실현 손익 (USDT) 렌더링 함수
  function renderProfit(raw: string | null) {
    if (!raw)
      return (
        <span className="text-gray-400 [:root[data-theme=dark]_&]:text-gray-500">
          -
        </span>
      );

    // 포맷 함수 적용
    const formatted = formatNumber(raw, 2);
    if (!formatted)
      return (
        <span className="text-gray-400 [:root[data-theme=dark]_&]:text-gray-500">
          -
        </span>
      );

    const num = Number(raw);

    const colorClass =
      num > 0
        ? "text-[#06b6d4]"
        : num < 0
          ? "text-red-500 [:root[data-theme=dark]_&]:text-red-400"
          : "text-gray-400";

    // 양수일 때 + 기호 추가
    return (
      <span className={`font-bold ${colorClass}`}>
        {num > 0 ? `+${formatted}` : formatted}
      </span>
    );
  }

  // 🚀 [수정] 수익률 (ROI) 렌더링 함수
  function renderRoi(raw: string | null) {
    if (!raw)
      return (
        <span className="text-gray-400 [:root[data-theme=dark]_&]:text-gray-500">
          -
        </span>
      );

    // 포맷 함수 적용 (ROI는 보통 %이므로 2자리 고정)
    const formatted = formatNumber(raw, 2);
    if (!formatted)
      return (
        <span className="text-gray-400 [:root[data-theme=dark]_&]:text-gray-500">
          -
        </span>
      );

    const num = Number(raw);

    const colorClass =
      num > 0
        ? "text-[#06b6d4]"
        : num < 0
          ? "text-red-500 [:root[data-theme=dark]_&]:text-red-400"
          : "text-gray-400";

    // 양수일 때 + 기호 추가
    return (
      <span className={`font-bold ${colorClass}`}>
        {num > 0 ? `+${formatted}` : formatted}
        <span className="text-xs opacity-70 ml-0.5">%</span>
      </span>
    );
  }

  function renderStatusBadge(status: string) {
    const isOpen = status === "OPEN";
    return (
      <span
        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
          isOpen
            ? "bg-green-100 text-green-600 border-green-200 [:root[data-theme=dark]_&]:bg-green-500/10 [:root[data-theme=dark]_&]:text-green-500 [:root[data-theme=dark]_&]:border-green-500/20"
            : "bg-gray-100 text-gray-500 border-gray-200 [:root[data-theme=dark]_&]:bg-gray-700/50 [:root[data-theme=dark]_&]:text-gray-400 [:root[data-theme=dark]_&]:border-gray-600"
        }`}
      >
        {t(`status.${status.toLowerCase()}`)}
      </span>
    );
  }

  // [수정] 테이블 스타일 (라이트/다크 분기)
  const thClass =
    "px-4 py-3 text-left text-xs font-medium uppercase tracking-wider border-b transition-colors " +
    "bg-gray-50 text-gray-500 border-gray-200 " +
    "[:root[data-theme=dark]_&]:bg-[#0B1222]/50 [:root[data-theme=dark]_&]:text-gray-400 [:root[data-theme=dark]_&]:border-gray-800 " +
    "first:rounded-tl-lg last:rounded-tr-lg";

  const tdClass =
    "px-4 py-3 text-sm border-b whitespace-nowrap transition-colors " +
    "border-gray-100 text-gray-600 " +
    "[:root[data-theme=dark]_&]:border-gray-800/50 [:root[data-theme=dark]_&]:text-gray-300";

  return (
    <section className="rounded-2xl shadow-xl overflow-hidden border transition-colors bg-white border-gray-200 [:root[data-theme=dark]_&]:bg-[#131B2D] [:root[data-theme=dark]_&]:border-gray-800">
      {/* 헤더: 총계 + 페이지네이션 */}
      <div className="p-4 border-b flex items-center justify-between transition-colors bg-gray-50 border-gray-200 [:root[data-theme=dark]_&]:bg-[#0B1222]/30 [:root[data-theme=dark]_&]:border-gray-800">
        <div className="text-sm text-gray-500 [:root[data-theme=dark]_&]:text-gray-400">
          {t("list.total", { count: total })}
        </div>

        <div className="flex items-center gap-2">
          <button
            className="btn btn-xs btn-square btn-ghost text-gray-500 disabled:opacity-30 [:root[data-theme=dark]_&]:text-gray-400"
            disabled={page <= 1}
            onClick={goPrev}
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
          <span className="text-sm font-mono text-gray-700 [:root[data-theme=dark]_&]:text-gray-300">
            {page} / {totalPages}
          </span>
          <button
            className="btn btn-xs btn-square btn-ghost text-gray-500 disabled:opacity-30 [:root[data-theme=dark]_&]:text-gray-400"
            disabled={page >= totalPages}
            onClick={goNext}
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <span className="loading loading-spinner loading-lg text-[#06b6d4]"></span>
        </div>
      ) : error ? (
        <div className="p-8 text-center m-4 rounded-lg border bg-red-50 border-red-200 text-red-600 [:root[data-theme=dark]_&]:bg-red-900/10 [:root[data-theme=dark]_&]:border-red-900/20 [:root[data-theme=dark]_&]:text-red-400">
          {error}
        </div>
      ) : rows.length === 0 ? (
        <div className="p-12 text-center text-gray-500">{t("list.empty")}</div>
      ) : (
        <>
          {/* 모바일 뷰 (카드 리스트) */}
          <div className="md:hidden divide-y divide-gray-100 [:root[data-theme=dark]_&]:divide-gray-800">
            {rows.map((row, idx) => (
              <div
                key={idx}
                className="p-4 space-y-3 transition-colors bg-white [:root[data-theme=dark]_&]:bg-[#131B2D]"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-base text-gray-900 [:root[data-theme=dark]_&]:text-white">
                      {row.botName}
                    </h3>
                    <div className="text-xs mt-0.5 text-gray-500 [:root[data-theme=dark]_&]:text-gray-500">
                      {row.exchange} • {row.symbol}
                    </div>
                  </div>
                  {renderStatusBadge(row.status)}
                </div>

                <div className="grid grid-cols-2 gap-y-2 text-xs">
                  <div>
                    <span className="block mb-0.5 text-gray-500">
                      {t("column.side")}
                    </span>
                    <span
                      className={
                        row.side === "LONG"
                          ? "text-green-600 [:root[data-theme=dark]_&]:text-green-400"
                          : "text-red-600 [:root[data-theme=dark]_&]:text-red-400"
                      }
                    >
                      {row.side} x{row.leverage}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="block mb-0.5 text-gray-500">
                      {t("column.roi")}
                    </span>
                    {renderRoi(row.realizedRoiPct)}
                  </div>
                  <div>
                    <span className="block mb-0.5 text-gray-500">
                      {t("column.entryPrice")}
                    </span>
                    {/* 🚀 [수정] 소수점 2자리 적용 */}
                    <span className="text-gray-700 [:root[data-theme=dark]_&]:text-gray-300">
                      {formatNumber(row.entryPrice, 2) || "-"}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="block mb-0.5 text-gray-500">
                      {t("column.profit")}
                    </span>
                    {renderProfit(row.profitUsdt)}
                  </div>
                </div>

                <div className="pt-2 border-t flex justify-between text-[10px] border-gray-100 text-gray-400 [:root[data-theme=dark]_&]:border-gray-800 [:root[data-theme=dark]_&]:text-gray-600">
                  <span>{formatDate(row.openedAt)}</span>
                  <span>{formatDate(row.closedAt)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* 데스크탑 뷰 (테이블) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className={thClass}>{t("column.status")}</th>
                  <th className={thClass}>{t("column.bot")}</th>
                  <th className={thClass}>{t("column.market")}</th>
                  <th className={thClass}>{t("column.side")}</th>
                  <th className={thClass}>{t("column.leverage")}</th>
                  <th className={thClass}>{t("column.entryPrice")}</th>
                  <th className={thClass}>{t("column.entryUsdt")}</th>
                  <th className={thClass}>{t("column.profit")}</th>
                  <th className={thClass}>{t("column.roi")}</th>
                  <th className={thClass}>{t("column.openedAt")}</th>
                  <th className={thClass}>{t("column.closedAt")}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-gray-50 transition-colors group [:root[data-theme=dark]_&]:hover:bg-[#0B1222]/50"
                  >
                    <td className={tdClass}>{renderStatusBadge(row.status)}</td>
                    <td
                      className={`${tdClass} font-medium text-gray-900 [:root[data-theme=dark]_&]:text-white`}
                    >
                      {row.botName}
                    </td>
                    <td className={tdClass}>
                      <span className="text-gray-500 [:root[data-theme=dark]_&]:text-gray-400">
                        {row.exchange}
                      </span>{" "}
                      <span className="text-gray-400 [:root[data-theme=dark]_&]:text-gray-500">
                        /
                      </span>{" "}
                      {row.symbol}
                    </td>
                    <td
                      className={`${tdClass} font-bold ${
                        row.side === "LONG"
                          ? "text-green-600 [:root[data-theme=dark]_&]:text-green-500"
                          : "text-red-600 [:root[data-theme=dark]_&]:text-red-500"
                      }`}
                    >
                      {row.side}
                    </td>
                    <td className={tdClass}>x{row.leverage}</td>
                    {/* 🚀 [수정] 소수점 2자리 적용 */}
                    <td className={tdClass}>
                      {formatNumber(row.entryPrice, 2) || "-"}
                    </td>
                    {/* 🚀 [수정] 소수점 2자리 적용 */}
                    <td className={tdClass}>
                      {formatNumber(row.entryCostUsdt, 2) || "-"}
                    </td>
                    <td className={tdClass}>{renderProfit(row.profitUsdt)}</td>
                    <td className={tdClass}>{renderRoi(row.realizedRoiPct)}</td>
                    <td
                      className={`${tdClass} text-xs text-gray-400 [:root[data-theme=dark]_&]:text-gray-500`}
                    >
                      {formatDate(row.openedAt)}
                    </td>
                    <td
                      className={`${tdClass} text-xs text-gray-400 [:root[data-theme=dark]_&]:text-gray-500`}
                    >
                      {formatDate(row.closedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}

export default HistoryTable;
