"use client";

import { ChangeEvent } from "react";
import { StrategyKind } from "@/generated/prisma";
import type { EditForm } from "../types/common";
import CommonSettingsSectionView from "./CommonSettingsSectionView";
import { useTranslations } from "next-intl";
import {
  PencilSquareIcon,
  XMarkIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";

type Props = {
  form: EditForm;
  setForm: (updater: (prev: EditForm) => EditForm) => void;
  updating: boolean;
  disabled?: boolean;
  onUpdateClick: () => void;
  onClose: () => void;
};

// 공통 스타일 (라이트/다크 분기) - CreateForm과 통일
const inputClass =
  "input input-bordered w-full transition-colors h-10 text-sm " +
  "bg-white border-gray-300 text-gray-900 focus:border-[#06b6d4] focus:outline-none " +
  "[:root[data-theme=dark]_&]:bg-[#0B1222] [:root[data-theme=dark]_&]:border-gray-700 [:root[data-theme=dark]_&]:text-gray-200";

const labelClass =
  "label-text text-xs font-medium mb-1 block " +
  "text-gray-600 [:root[data-theme=dark]_&]:text-gray-400";

export default function EditStrategyFormView({
  form,
  setForm,
  updating,
  disabled = false,
  onUpdateClick,
  onClose,
}: Props) {
  const t = useTranslations("strategy-config");

  const showTrend =
    form.kind === StrategyKind.TREND || form.kind === StrategyKind.BOTH;
  const showBox =
    form.kind === StrategyKind.BOX || form.kind === StrategyKind.BOTH;

  return (
    // [수정] 카드 스타일 (Create 폼과 통일된 디자인 언어)
    <div className="bg-white border border-gray-200 transition-colors [:root[data-theme=dark]_&]:bg-[#131B2D] [:root[data-theme=dark]_&]:border-gray-800">
      {/* 헤더 영역 (Sticky) */}
      <div className="p-5 border-b flex items-center justify-between sticky top-0 z-10 bg-white/95 backdrop-blur border-gray-200 [:root[data-theme=dark]_&]:bg-[#131B2D]/95 [:root[data-theme=dark]_&]:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#06b6d4]/10 rounded-lg text-[#06b6d4]">
            <PencilSquareIcon className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 [:root[data-theme=dark]_&]:text-white">
              {t("edit.title")}
            </h2>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200 [:root[data-theme=dark]_&]:bg-gray-800 [:root[data-theme=dark]_&]:border-gray-700">
                ID: {form.id}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="btn btn-sm btn-ghost btn-circle text-gray-500 hover:bg-gray-100 [:root[data-theme=dark]_&]:text-gray-400 [:root[data-theme=dark]_&]:hover:bg-gray-800"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>

      <div className="p-6 space-y-8">
        {/* 공통 설정 섹션 (기존 컴포넌트 재사용) */}
        <CommonSettingsSectionView
          form={form}
          setForm={(u) => setForm((prev) => ({ ...prev, ...u(prev) }))}
          disabled={updating || disabled}
        />

        {/* TREND 설정 섹션 */}
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
                  inputMode="decimal"
                  value={form.trendRsiUpperPullback}
                  disabled={updating || disabled}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
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
                  inputMode="decimal"
                  value={form.trendRsiLowerPullback}
                  disabled={updating || disabled}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
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

        {/* BOX 설정 섹션 */}
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
                  disabled={updating || disabled}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
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
                  disabled={updating || disabled}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
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
                  disabled={updating || disabled}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setForm((s) => ({ ...s, boxTouchPct: e.target.value }))
                  }
                />
              </div>
            </div>
          </section>
        )}
      </div>

      {/* 하단 액션 버튼 (Sticky) */}
      <div className="p-5 border-t sticky bottom-0 bg-gray-50 border-gray-200 flex justify-end gap-3 [:root[data-theme=dark]_&]:bg-[#0B1222] [:root[data-theme=dark]_&]:border-gray-800">
        <button
          type="button"
          className="btn btn-ghost text-gray-500 hover:bg-gray-200 [:root[data-theme=dark]_&]:text-gray-400 [:root[data-theme=dark]_&]:hover:bg-white/10"
          onClick={onClose}
          disabled={updating}
        >
          {t("action.close")}
        </button>
        <button
          type="button"
          className="btn btn-primary bg-[#06b6d4] hover:bg-[#0891b2] border-none text-white px-6 gap-2 shadow-lg shadow-cyan-500/20 [:root[data-theme=dark]_&]:shadow-cyan-900/20"
          disabled={updating || disabled}
          onClick={onUpdateClick}
        >
          {updating ? (
            <span className="loading loading-spinner loading-sm"></span>
          ) : (
            <CheckIcon className="h-4 w-4" />
          )}
          {updating ? t("action.saving") : t("action.update")}
        </button>
      </div>
    </div>
  );
}
