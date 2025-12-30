"use client";

import { useState, useEffect } from "react";
// [수정] CommonFormSlice 대신 CreateForm을 import
import type { CreateForm } from "../types/common";
import { useTranslations } from "next-intl";
import { STRATEGY_PRESETS, PresetType } from "../constants/presets";
import {
  FireIcon,
  ShieldCheckIcon,
  ScaleIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/outline";
import CustomStrategyModal from "./CustomStrategyModal";

type Props = {
  // [수정] form 타입을 CreateForm으로 변경 (모든 필드 포함)
  form: CreateForm;
  // [수정] setForm 타입도 CreateForm 기준으로 변경
  setForm: (updater: (prev: CreateForm) => Partial<CreateForm>) => void;
  disabled?: boolean;
};

// 스타일 상수
const inputClass =
  "input input-bordered w-full transition-colors h-11 text-sm " +
  "bg-white border-gray-300 text-gray-900 focus:border-[#06b6d4] focus:outline-none " +
  "[:root[data-theme=dark]_&]:bg-[#0B1222] [:root[data-theme=dark]_&]:border-gray-700 [:root[data-theme=dark]_&]:text-gray-200";

const labelClass =
  "label-text text-xs font-bold mb-1.5 block uppercase tracking-wide " +
  "text-gray-500 [:root[data-theme=dark]_&]:text-gray-400";

export default function CommonSettingsSectionView({
  form,
  setForm,
  disabled = false,
}: Props) {
  const t = useTranslations("strategy-config");
  const [selectedPreset, setSelectedPreset] = useState<PresetType | null>(null);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);

  // [Fix] Form values to Preset matching logic
  useEffect(() => {
    const isMatch = (preset: (typeof STRATEGY_PRESETS)[keyof typeof STRATEGY_PRESETS]) => {
      // Compare all 12 key fields (using loose equality for string/number safety if needed, 
      // but assuming strict string match based on presets.ts)
      return (
        form.kind === preset.kind &&
        form.timeframe === preset.timeframe &&
        form.rsiLength === preset.rsiLength &&
        form.leverage === preset.leverage &&
        form.targetProfit === preset.targetProfit &&
        form.targetLoss === preset.targetLoss &&
        form.minAtrPct === preset.minAtrPct &&
        form.trendRsiUpperPullback === preset.trendRsiUpperPullback &&
        form.trendRsiLowerPullback === preset.trendRsiLowerPullback &&
        form.upperTh === preset.upperTh &&
        form.lowerTh === preset.lowerTh &&
        form.boxTouchPct === preset.boxTouchPct
      );
    };

    if (isMatch(STRATEGY_PRESETS.A)) {
      setSelectedPreset("A");
    } else if (isMatch(STRATEGY_PRESETS.B)) {
      setSelectedPreset("B");
    } else if (isMatch(STRATEGY_PRESETS.C)) {
      setSelectedPreset("C");
    } else {
      // If none match, it's Custom (D)
      setSelectedPreset("D");
    }
  }, [
    form.kind,
    form.timeframe,
    form.rsiLength,
    form.leverage,
    form.targetProfit,
    form.targetLoss,
    form.minAtrPct,
    form.trendRsiUpperPullback,
    form.trendRsiLowerPullback,
    form.upperTh,
    form.lowerTh,
    form.boxTouchPct,
  ]);

  // 프리셋 적용 핸들러
  const handlePresetClick = (type: PresetType) => {
    // [Fix] If clicking D (Custom) and we are already in D mode (custom values),
    // do NOT overwrite with defaults. Just open modal.
    if (type === "D") {
      if (selectedPreset === "D") {
        setIsCustomModalOpen(true);
        return;
      }
      
      // If switching from A/B/C to D, load D defaults
      const p = STRATEGY_PRESETS.D;
      setForm((prev) => ({
        ...prev,
        kind: p.kind,
        timeframe: p.timeframe,
        rsiLength: p.rsiLength,
        leverage: p.leverage,
        targetProfit: p.targetProfit,
        targetLoss: p.targetLoss,
        minAtrPct: p.minAtrPct,
        trendRsiUpperPullback: p.trendRsiUpperPullback,
        trendRsiLowerPullback: p.trendRsiLowerPullback,
        upperTh: p.upperTh,
        lowerTh: p.lowerTh,
        boxTouchPct: p.boxTouchPct,
      }));
      setIsCustomModalOpen(true);
      // selectedPreset will eventually become "D" via useEffect
    } else {
      setSelectedPreset(type); // Optimistic update (useEffect will confirm)
      // A, B, C 전략은 바로 적용
      const p = STRATEGY_PRESETS[type];
      setForm((prev) => ({
        ...prev,
        kind: p.kind,
        timeframe: p.timeframe,
        rsiLength: p.rsiLength,
        leverage: p.leverage,
        targetProfit: p.targetProfit,
        targetLoss: p.targetLoss,
        minAtrPct: p.minAtrPct,
        trendRsiUpperPullback: p.trendRsiUpperPullback,
        trendRsiLowerPullback: p.trendRsiLowerPullback,
        upperTh: p.upperTh,
        lowerTh: p.lowerTh,
        boxTouchPct: p.boxTouchPct,
      }));
    }
  };

  return (
    <>
      <div className="space-y-8">
        {/* 1. 전략 이름 */}
        <section>
          <label htmlFor="name" className={labelClass}>
            {t("field.name")}
          </label>
          <input
            id="name"
            className={inputClass}
            placeholder={t("placeholder.name")}
            value={form.name}
            disabled={disabled}
            onChange={(e) => setForm(() => ({ name: e.target.value }))}
          />
        </section>

        {/* 2. 전략 선택 (A/B/C/D) */}
        <section>
          <label className={labelClass}>{t("section.strategySelect")}</label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* A 전략 */}
            <div
              onClick={() => !disabled && handlePresetClick("A")}
              className={`cursor-pointer rounded-xl border-2 p-5 transition-all relative overflow-hidden ${
                selectedPreset === "A"
                  ? "border-[#06b6d4] bg-[#06b6d4]/5"
                  : "border-gray-200 bg-white hover:border-[#06b6d4]/50 [:root[data-theme=dark]_&]:bg-[#0B1222] [:root[data-theme=dark]_&]:border-gray-700"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={`p-2 rounded-lg ${selectedPreset === "A" ? "bg-[#06b6d4] text-white" : "bg-gray-100 text-gray-500 [:root[data-theme=dark]_&]:bg-gray-800"}`}
                >
                  <FireIcon className="h-6 w-6" />
                </div>
                <h3
                  className={`font-bold text-lg ${selectedPreset === "A" ? "text-[#06b6d4]" : "text-gray-700 [:root[data-theme=dark]_&]:text-gray-300"}`}
                >
                  {t("presets.A.label")}
                </h3>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed min-h-[40px]">
                {t("presets.A.description")}
              </p>
            </div>

            {/* B 전략 */}
            <div
              onClick={() => !disabled && handlePresetClick("B")}
              className={`cursor-pointer rounded-xl border-2 p-5 transition-all relative overflow-hidden ${
                selectedPreset === "B"
                  ? "border-[#06b6d4] bg-[#06b6d4]/5"
                  : "border-gray-200 bg-white hover:border-[#06b6d4]/50 [:root[data-theme=dark]_&]:bg-[#0B1222] [:root[data-theme=dark]_&]:border-gray-700"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={`p-2 rounded-lg ${selectedPreset === "B" ? "bg-[#06b6d4] text-white" : "bg-gray-100 text-gray-500 [:root[data-theme=dark]_&]:bg-gray-800"}`}
                >
                  <ScaleIcon className="h-6 w-6" />
                </div>
                <h3
                  className={`font-bold text-lg ${selectedPreset === "B" ? "text-[#06b6d4]" : "text-gray-700 [:root[data-theme=dark]_&]:text-gray-300"}`}
                >
                  {t("presets.B.label")}
                </h3>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed min-h-[40px]">
                {t("presets.B.description")}
              </p>
            </div>

            {/* C 전략 */}
            <div
              onClick={() => !disabled && handlePresetClick("C")}
              className={`cursor-pointer rounded-xl border-2 p-5 transition-all relative overflow-hidden ${
                selectedPreset === "C"
                  ? "border-[#06b6d4] bg-[#06b6d4]/5"
                  : "border-gray-200 bg-white hover:border-[#06b6d4]/50 [:root[data-theme=dark]_&]:bg-[#0B1222] [:root[data-theme=dark]_&]:border-gray-700"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={`p-2 rounded-lg ${selectedPreset === "C" ? "bg-[#06b6d4] text-white" : "bg-gray-100 text-gray-500 [:root[data-theme=dark]_&]:bg-gray-800"}`}
                >
                  <ShieldCheckIcon className="h-6 w-6" />
                </div>
                <h3
                  className={`font-bold text-lg ${selectedPreset === "C" ? "text-[#06b6d4]" : "text-gray-700 [:root[data-theme=dark]_&]:text-gray-300"}`}
                >
                  {t("presets.C.label")}
                </h3>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed min-h-[40px]">
                {t("presets.C.description")}
              </p>
            </div>

            {/* D 전략 (커스텀) */}
            <div
              onClick={() => !disabled && handlePresetClick("D")}
              className={`cursor-pointer rounded-xl border-2 p-5 transition-all relative overflow-hidden ${
                selectedPreset === "D"
                  ? "border-[#06b6d4] bg-[#06b6d4]/5"
                  : "border-gray-200 bg-white hover:border-[#06b6d4]/50 [:root[data-theme=dark]_&]:bg-[#0B1222] [:root[data-theme=dark]_&]:border-gray-700"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={`p-2 rounded-lg ${selectedPreset === "D" ? "bg-[#06b6d4] text-white" : "bg-gray-100 text-gray-500 [:root[data-theme=dark]_&]:bg-gray-800"}`}
                >
                  <AdjustmentsHorizontalIcon className="h-6 w-6" />
                </div>
                <h3
                  className={`font-bold text-lg ${selectedPreset === "D" ? "text-[#06b6d4]" : "text-gray-700 [:root[data-theme=dark]_&]:text-gray-300"}`}
                >
                  {t("presets.D.label")}
                </h3>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed min-h-[40px]">
                {t("presets.D.description")}
              </p>
              {selectedPreset === "D" && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsCustomModalOpen(true);
                  }}
                  className="mt-2 w-full btn btn-xs btn-outline border-[#06b6d4] text-[#06b6d4] hover:bg-[#06b6d4] hover:text-white"
                >
                  설정 변경
                </button>
              )}
            </div>
          </div>
        </section>

        {/* 3. 진입가 설정 */}
        <section>
          <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 [:root[data-theme=dark]_&]:text-white">
            <span className="w-1 h-4 bg-[#06b6d4] rounded-full"></span>
            {t("section.entry")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>{t("field.defaultSize")}</label>
              <div className="relative">
                <input
                  className={inputClass}
                  inputMode="numeric"
                  value={form.defaultSize}
                  disabled={disabled}
                  onChange={(e) =>
                    setForm(() => ({ defaultSize: e.target.value }))
                  }
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                  USDT
                </span>
              </div>
            </div>
            <div>
              <label className={labelClass}>{t("field.maxSize")}</label>
              <div className="relative">
                <input
                  className={inputClass}
                  inputMode="numeric"
                  value={form.maxSize}
                  disabled={disabled}
                  onChange={(e) => setForm(() => ({ maxSize: e.target.value }))}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                  USDT
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 4. 마틴 설정 */}
        <section>
          <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 [:root[data-theme=dark]_&]:text-white">
            <span className="w-1 h-4 bg-[#06b6d4] rounded-full"></span>
            {t("section.martingale")}
          </h3>
          <div className="p-5 rounded-xl border bg-gray-50 border-gray-200 [:root[data-theme=dark]_&]:bg-[#0B1222] [:root[data-theme=dark]_&]:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-700 [:root[data-theme=dark]_&]:text-gray-200">
                {t("field.useMartin")}
              </span>
              <input
                type="checkbox"
                className="toggle toggle-success border-gray-300 bg-white checked:bg-[#06b6d4] checked:border-[#06b6d4] [:root[data-theme=dark]_&]:border-gray-600 [:root[data-theme=dark]_&]:bg-gray-800"
                checked={form.useMartin}
                disabled={disabled}
                onChange={(e) =>
                  setForm(() => ({ useMartin: e.target.checked }))
                }
              />
            </div>

            {form.useMartin && (
              <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                <label className={labelClass}>
                  {t("field.martinMultiplier")}
                </label>
                <div className="relative">
                  <input
                    className={inputClass}
                    inputMode="decimal"
                    value={form.martinMultiplier}
                    disabled={disabled}
                    onChange={(e) =>
                      setForm(() => ({ martinMultiplier: e.target.value }))
                    }
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                    X
                  </span>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* 커스텀 설정 모달 */}
      {isCustomModalOpen && (
        <CustomStrategyModal
          form={form}
          setForm={setForm}
          onClose={() => setIsCustomModalOpen(false)}
        />
      )}
    </>
  );
}
