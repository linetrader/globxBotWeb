"use client";

// [수정] 사용하지 않는 ChangeEvent 제거
import type { StrategyRow } from "../types/table";
import { useTranslations } from "next-intl";
import { TrashIcon } from "@heroicons/react/24/outline";

type Props = {
  rows: StrategyRow[];
  allSelected: boolean;
  selectedCount: number;
  loading: boolean;
  onToggleAll: (checked: boolean) => void;
  onRowClick: (idx: number) => void;
  onToggleRow: (idx: number, checked: boolean) => void;
  onDeleteSelected: () => void;
};

export default function StrategyConfigsTableView({
  rows,
  allSelected,
  selectedCount,
  loading,
  onToggleAll,
  onRowClick,
  onToggleRow,
  onDeleteSelected,
}: Props) {
  const t = useTranslations("strategy-config");

  return (
    // [수정] 테이블 컨테이너 스타일
    <div className="rounded-2xl shadow-xl overflow-hidden border transition-colors bg-white border-gray-200 [:root[data-theme=dark]_&]:bg-[#131B2D] [:root[data-theme=dark]_&]:border-gray-800">
      {/* 헤더 */}
      <div className="border-b p-4 flex items-center justify-between transition-colors bg-gray-50 border-gray-200 [:root[data-theme=dark]_&]:bg-[#0B1222]/50 [:root[data-theme=dark]_&]:border-gray-800">
        <h2 className="text-base font-bold text-gray-900 [:root[data-theme=dark]_&]:text-gray-200">
          {t("list.title")}{" "}
          <span className="text-xs font-normal text-gray-500 ml-2">
            Total {rows.length}
          </span>
        </h2>
        {selectedCount > 0 && (
          <button
            type="button"
            className="btn btn-xs btn-error btn-outline gap-1"
            onClick={onDeleteSelected}
          >
            <TrashIcon className="h-3 w-3" />
            {t("action.deleteSelected", { count: selectedCount })}
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr className="border-b text-xs uppercase tracking-wider transition-colors bg-gray-50 border-gray-200 text-gray-500 [:root[data-theme=dark]_&]:bg-[#0B1222]/30 [:root[data-theme=dark]_&]:border-gray-800 [:root[data-theme=dark]_&]:text-gray-400">
              <th className="w-12 text-center">
                <input
                  type="checkbox"
                  className="checkbox checkbox-xs border-gray-300 [--chkbg:#06b6d4] [--chkfg:white] checked:border-[#06b6d4] [:root[data-theme=dark]_&]:border-gray-600"
                  checked={allSelected}
                  onChange={(e) => onToggleAll(e.target.checked)}
                />
              </th>
              <th>{t("table.updatedAt")}</th>
              <th>{t("table.name")}</th>
              <th>{t("table.kind")}</th>
              <th>{t("table.detail")}</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-12">
                  <span className="loading loading-spinner loading-md text-[#06b6d4]"></span>
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-gray-500">
                  {t("list.empty")}
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr
                  key={r.idx}
                  onClick={() => onRowClick(r.idx)}
                  className={`
                    border-b cursor-pointer transition-colors
                    border-gray-100 hover:bg-gray-50
                    [:root[data-theme=dark]_&]:border-gray-800/50 [:root[data-theme=dark]_&]:hover:bg-[#0B1222]/50
                    ${
                      r.checked
                        ? "bg-[#06b6d4]/5 [:root[data-theme=dark]_&]:bg-[#06b6d4]/10"
                        : ""
                    }
                  `}
                >
                  <td
                    className="text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      className="checkbox checkbox-xs border-gray-300 [--chkbg:#06b6d4] [--chkfg:white] checked:border-[#06b6d4] [:root[data-theme=dark]_&]:border-gray-600"
                      checked={r.checked}
                      onChange={(e) => onToggleRow(r.idx, e.target.checked)}
                    />
                  </td>
                  <td className="text-gray-500 whitespace-nowrap [:root[data-theme=dark]_&]:text-gray-400">
                    {r.updatedAt}
                  </td>
                  <td className="font-bold text-gray-900 [:root[data-theme=dark]_&]:text-white">
                    {r.name}
                  </td>
                  <td>
                    <span className="badge badge-sm border-gray-200 bg-gray-100 text-gray-600 [:root[data-theme=dark]_&]:border-gray-700 [:root[data-theme=dark]_&]:bg-gray-800 [:root[data-theme=dark]_&]:text-gray-300">
                      {r.kind}
                    </span>
                  </td>
                  <td
                    className="text-gray-500 max-w-xs truncate [:root[data-theme=dark]_&]:text-gray-400"
                    title={r.detail}
                  >
                    {r.detail}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
