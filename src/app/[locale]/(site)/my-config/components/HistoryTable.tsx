// src/app/[locale]/(site)/my-config/components/HistoryTable.tsx

"use client";

import type { UseMyConfigReturn } from "../hooks/useMyConfig";
import { useTranslations } from "next-intl";
import { ClockIcon } from "@heroicons/react/24/outline";

type Props = { vm: UseMyConfigReturn };

function formatUid(uid?: string): string {
  if (!uid) return "-";
  if (uid.length <= 12) return uid;
  return `${uid.slice(0, 6)}...${uid.slice(-4)}`;
}

export function HistoryTable({ vm }: Props) {
  const t = useTranslations("my-config");
  const { history, selectedIds, onToggleRow, onToggleAll } = vm;

  const allSelected =
    history.length > 0 && history.every((h) => selectedIds.has(h.id));

  return (
    // [수정] 테이블 컨테이너 스타일 (라이트/다크)
    <div className="h-full flex flex-col rounded-2xl shadow-xl overflow-hidden border transition-colors bg-white border-gray-200 [:root[data-theme=dark]_&]:bg-[#131B2D] [:root[data-theme=dark]_&]:border-gray-800">
      <div className="p-5 border-b flex items-center justify-between transition-colors bg-gray-50 border-gray-200 [:root[data-theme=dark]_&]:bg-[#0B1222]/30 [:root[data-theme=dark]_&]:border-gray-800">
        <div className="flex items-center gap-2">
          <ClockIcon className="h-5 w-5 text-[#06b6d4]" />
          <h2 className="text-base font-bold text-gray-900 [:root[data-theme=dark]_&]:text-gray-200">
            {t("history.title")}
          </h2>
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-600 [:root[data-theme=dark]_&]:bg-gray-800 [:root[data-theme=dark]_&]:text-gray-500">
          Total {history.length}
        </span>
      </div>

      <div className="flex-1 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b text-xs uppercase tracking-wider transition-colors bg-gray-50 text-gray-500 border-gray-200 [:root[data-theme=dark]_&]:bg-[#0B1222]/50 [:root[data-theme=dark]_&]:text-gray-400 [:root[data-theme=dark]_&]:border-gray-800">
              <th className="w-12 px-4 py-3 text-center">
                <input
                  type="checkbox"
                  className="checkbox checkbox-xs border-gray-300 [--chkbg:#06b6d4] [--chkfg:white] checked:border-[#06b6d4] [:root[data-theme=dark]_&]:border-gray-600"
                  checked={allSelected}
                  onChange={(e) => onToggleAll(e.target.checked)}
                />
              </th>
              <th className="px-4 py-3 text-left">{t("table.updatedAt")}</th>
              <th className="px-4 py-3 text-left">{t("table.exchange")}</th>
              <th className="px-4 py-3 text-left">{t("table.uid")}</th>
              <th className="px-4 py-3 text-left">{t("table.createdAt")}</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {history.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="text-center py-12 text-gray-500 [:root[data-theme=dark]_&]:text-gray-500"
                >
                  {t("history.empty")}
                </td>
              </tr>
            ) : (
              history.map((h, idx) => {
                const isSelected = selectedIds.has(h.id);
                return (
                  <tr
                    key={h.id}
                    onClick={() => onToggleRow(idx, !isSelected)}
                    className={`
                      border-b cursor-pointer transition-colors
                      border-gray-100 hover:bg-gray-50
                      [:root[data-theme=dark]_&]:border-gray-800/50 [:root[data-theme=dark]_&]:hover:bg-[#0B1222]/50
                      ${
                        isSelected
                          ? "bg-[#06b6d4]/5 [:root[data-theme=dark]_&]:bg-[#06b6d4]/5"
                          : ""
                      }
                    `}
                  >
                    <td
                      className="px-4 py-3 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        className="checkbox checkbox-xs border-gray-300 [--chkbg:#06b6d4] [--chkfg:white] checked:border-[#06b6d4] [:root[data-theme=dark]_&]:border-gray-600"
                        checked={isSelected}
                        onChange={(e) => onToggleRow(idx, e.target.checked)}
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500 [:root[data-theme=dark]_&]:text-gray-400">
                      {new Date(h.updatedAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900 [:root[data-theme=dark]_&]:text-gray-200">
                      {h.exchangeName}{" "}
                      <span className="text-xs text-gray-500 [:root[data-theme=dark]_&]:text-gray-500">
                        ({h.exchangeCode})
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600 [:root[data-theme=dark]_&]:text-gray-300">
                      {formatUid(h.uid)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500 [:root[data-theme=dark]_&]:text-gray-500">
                      {new Date(h.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
