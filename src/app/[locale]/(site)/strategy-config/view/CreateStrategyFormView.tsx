"use client";

import { useState } from "react";
import { StrategyKind } from "@/generated/prisma";
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

// [수정] 공통 스타일 (라이트/다크 분기)
const inputClass =
  "input input-bordered w-full transition-colors h-10 text-sm " +
  "bg-white border-gray-300 text-gray-900 focus:border-[#06b6d4] focus:outline-none " +
  "[:root[data-theme=dark]_&]:bg-[#0B1222] [:root[data-theme=dark]_&]:border-gray-700 [:root[data-theme=dark]_&]:text-gray-200";

const labelClass =
  "label-text text-xs font-medium mb-1 block " +
  "text-gray-600 [:root[data-theme=dark]_&]:text-gray-400";

export default function CreateStrategyFormView({
  form,
  setForm,
  creating,
  error,
  onCreateClick,
}: Props) {
  const t = useTranslations("strategy-config");
  const [isExpanded, setIsExpanded] = useState(true);

  const showTrend =
    form.kind === StrategyKind.TREND || form.kind === StrategyKind.BOTH;
  const showBox =
    form.kind === StrategyKind.BOX || form.kind === StrategyKind.BOTH;

  return (
    // [수정] 카드 컨테이너 스타일
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
          <CommonSettingsSectionView
            form={form}
            setForm={(u) => setForm((prev) => ({ ...prev, ...u(prev) }))}
            disabled={creating}
          />

          {showTrend && (
            <section className="rounded-xl p-5 border bg-gray-50 border-gray-200 [:root[data-theme=dark]_&]:bg-[#0B1222]/50 [:root[data-theme=dark]_&]:border-gray-800/50">
              <h3 className="text-sm font-bold text-[#06b6d4] mb-4 uppercase tracking-wider">
                {t("section.trend")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="trend-upper" className={labelClass}>
                    {t("field.trendUpper")}
                  </label>
                  <input
                    id="trend-upper"
                    className={inputClass}
                    placeholder={t("placeholder.floatOrNull")}
                    inputMode="decimal"
                    value={form.trendRsiUpperPullback}
                    disabled={creating}
                    onChange={(e) =>
                      setForm((s) => ({
                        ...s,
                        trendRsiUpperPullback: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label htmlFor="trend-lower" className={labelClass}>
                    {t("field.trendLower")}
                  </label>
                  <input
                    id="trend-lower"
                    className={inputClass}
                    placeholder={t("placeholder.floatOrNull")}
                    inputMode="decimal"
                    value={form.trendRsiLowerPullback}
                    disabled={creating}
                    onChange={(e) =>
                      setForm((s) => ({
                        ...s,
                        trendRsiLowerPullback: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </section>
          )}

          {showBox && (
            <section className="rounded-xl p-5 border bg-gray-50 border-gray-200 [:root[data-theme=dark]_&]:bg-[#0B1222]/50 [:root[data-theme=dark]_&]:border-gray-800/50">
              <h3 className="text-sm font-bold text-[#06b6d4] mb-4 uppercase tracking-wider">
                {t("section.box")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="box-upper" className={labelClass}>
                    {t("field.boxUpper")}
                  </label>
                  <input
                    id="box-upper"
                    className={inputClass}
                    inputMode="decimal"
                    value={form.upperTh}
                    disabled={creating}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, upperTh: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label htmlFor="box-lower" className={labelClass}>
                    {t("field.boxLower")}
                  </label>
                  <input
                    id="box-lower"
                    className={inputClass}
                    inputMode="decimal"
                    value={form.lowerTh}
                    disabled={creating}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, lowerTh: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label htmlFor="box-touch" className={labelClass}>
                    {t("field.boxTouch")}
                  </label>
                  <input
                    id="box-touch"
                    className={inputClass}
                    placeholder={t("placeholder.floatOrNull")}
                    inputMode="decimal"
                    value={form.boxTouchPct}
                    disabled={creating}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, boxTouchPct: e.target.value }))
                    }
                  />
                </div>
              </div>
            </section>
          )}

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
