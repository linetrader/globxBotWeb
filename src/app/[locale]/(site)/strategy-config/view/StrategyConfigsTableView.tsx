// src/app/(site)/strategy-config/view/StrategyConfigsTableView.tsx
"use client";

import { ChangeEvent } from "react";
import type { StrategyRow } from "../types/table";

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
  const headLabels = ["수정시각", "시장", "이름", "종류", "세부설정"] as const;

  return (
    <div className="card bg-base-100 shadow mb-4">
      <div className="card-body p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold">전략 목록</h2>
          <div className="flex gap-2">
            <button
              type="button"
              className={`btn btn-primary btn-sm ${
                selectedCount === 0 ? "btn-disabled" : ""
              }`}
              onClick={() => {
                if (selectedCount === 0) return;
                onDeleteSelected();
              }}
              disabled={selectedCount === 0}
            >
              {`선택 삭제 (${selectedCount})`}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-box border border-base-300">
          <table className="table table-zebra table-sm">
            <thead className="bg-base-200 sticky top-0">
              <tr>
                <th className="w-10">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-sm"
                    checked={allSelected}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      onToggleAll(e.target.checked)
                    }
                  />
                </th>
                {headLabels.map((label) => (
                  <th key={label} className="text-left">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.idx}
                  className="cursor-pointer hover"
                  onClick={() => onRowClick(r.idx)}
                >
                  <td onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm"
                      checked={r.checked}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        onToggleRow(r.idx, e.target.checked)
                      }
                    />
                  </td>
                  <td>{r.updatedAt}</td>
                  <td>{r.name}</td>
                  <td>{r.kind}</td>
                  <td>{r.detail}</td>
                </tr>
              ))}

              {rows.length === 0 && !loading && (
                <tr>
                  <td colSpan={headLabels.length + 1}>
                    <div className="p-4 text-sm text-base-content/60">
                      데이터가 없습니다.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {loading && (
          <div className="mt-2 text-xs text-base-content/60 inline-flex items-center gap-2">
            <span className="loading loading-spinner loading-xs" />
            로딩 중…
          </div>
        )}
      </div>
    </div>
  );
}
