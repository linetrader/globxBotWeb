"use client";

import { useState } from "react";
import type { CreateForm } from "../types/common";
import CommonSettingsSectionView from "./CommonSettingsSectionView";
import { useTranslations } from "next-intl";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

type Props = {
  form: CreateForm;
  setForm: (updater: (prev: CreateForm) => CreateForm) => void;
  creating: boolean;
  error: string;
  onCreateClick: () => void;
};

export default function CreateStrategyFormView({
  form,
  setForm,
  creating,
  error,
  onCreateClick,
}: Props) {
  const t = useTranslations("strategy-config");
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="rounded-2xl shadow-xl overflow-hidden border transition-colors bg-white border-gray-200 [:root[data-theme=dark]_&]:bg-[#131B2D] [:root[data-theme=dark]_&]:border-gray-800">
      <div
        className="p-5 flex items-center justify-between cursor-pointer transition-colors bg-gray-50 hover:bg-gray-100 [:root[data-theme=dark]_&]:bg-[#0B1222]/30 [:root[data-theme=dark]_&]:hover:bg-[#0B1222]/50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h2 className="text-lg font-bold text-gray-900 [:root[data-theme=dark]_&]:text-white">
          {t("create.title")}
        </h2>
        <button className="btn btn-xs btn-ghost btn-circle text-gray-500 [:root[data-theme=dark]_&]:text-gray-400">
          {isExpanded ? (
            <ChevronUpIcon className="h-5 w-5" />
          ) : (
            <ChevronDownIcon className="h-5 w-5" />
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="p-6 space-y-8 animate-in fade-in slide-in-from-top-2 duration-300">
          {/* [수정] 복잡한 Trend/Box 섹션 제거 및 공통 뷰만 사용 */}
          <CommonSettingsSectionView
            form={form}
            setForm={(u) => setForm((prev) => ({ ...prev, ...u(prev) }))}
            disabled={creating}
          />

          <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200 [:root[data-theme=dark]_&]:border-gray-800">
            {error && <span className="text-sm text-red-500">{error}</span>}
            <button
              type="button"
              className="btn btn-primary bg-[#06b6d4] hover:bg-[#0891b2] border-none text-white font-bold px-8 shadow-lg shadow-cyan-500/20 [:root[data-theme=dark]_&]:shadow-cyan-900/20"
              disabled={creating}
              onClick={onCreateClick}
            >
              {creating ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                t("action.create")
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
