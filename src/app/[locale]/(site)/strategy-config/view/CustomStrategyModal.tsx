"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Timeframe, StrategyKind } from "@/generated/prisma";
// [수정] CommonFormSlice -> CreateForm 변경 (모든 필드를 포함하는 타입 사용)
import type { CreateForm } from "../types/common";

type Props = {
  // [수정] form과 setForm의 타입을 CreateForm으로 변경
  form: CreateForm;
  setForm: (updater: (prev: CreateForm) => Partial<CreateForm>) => void;
  onClose: () => void;
};

// 스타일 상수 (CommonSettingsSectionView와 통일)
const inputClass =
  "input input-bordered w-full transition-colors h-10 text-sm " +
  "bg-white border-gray-300 text-gray-900 focus:border-[#06b6d4] focus:outline-none " +
  "[:root[data-theme=dark]_&]:bg-[#0B1222] [:root[data-theme=dark]_&]:border-gray-700 [:root[data-theme=dark]_&]:text-gray-200";

const selectClass =
  "select select-bordered w-full transition-colors h-10 text-sm " +
  "bg-white border-gray-300 text-gray-900 focus:border-[#06b6d4] focus:outline-none " +
  "[:root[data-theme=dark]_&]:bg-[#0B1222] [:root[data-theme=dark]_&]:border-gray-700 [:root[data-theme=dark]_&]:text-gray-200";

const labelClass =
  "label-text text-xs font-medium mb-1 block " +
  "text-gray-600 [:root[data-theme=dark]_&]:text-gray-400";

const checkboxClass =
  "checkbox checkbox-sm [--chkbg:#06b6d4] [--chkfg:white] checked:border-[#06b6d4] " +
  "border-gray-300 [:root[data-theme=dark]_&]:border-gray-600";

export default function CustomStrategyModal({ form, setForm, onClose }: Props) {
  const t = useTranslations("strategy-config");

  // ESC 키로 닫기
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      />

      <div className="relative w-full max-w-3xl max-h-[85vh] flex flex-col rounded-2xl shadow-2xl bg-white border border-gray-200 [:root[data-theme=dark]_&]:bg-[#131B2D] [:root[data-theme=dark]_&]:border-gray-800 animate-in zoom-in-95 fade-in duration-300">
        {/* 헤더 */}
        <div className="p-5 border-b flex items-center justify-between shrink-0 border-gray-200 [:root[data-theme=dark]_&]:border-gray-800">
          <h3 className="text-lg font-bold text-gray-900 [:root[data-theme=dark]_&]:text-white">
            {t("customModal.title")}
          </h3>
          <button
            onClick={onClose}
            className="btn btn-sm btn-ghost btn-circle text-gray-500 hover:bg-gray-100 [:root[data-theme=dark]_&]:text-gray-400 [:root[data-theme=dark]_&]:hover:bg-gray-800"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* 바디 (스크롤 가능) */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
          {/* 1. 기본 설정 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="kind" className={labelClass}>
                {t("field.kind")}
              </label>
              <select
                id="kind"
                className={selectClass}
                value={form.kind}
                onChange={(e) =>
                  setForm(() => ({ kind: e.target.value as StrategyKind }))
                }
              >
                {Object.values(StrategyKind).map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="timeframe" className={labelClass}>
                {t("field.timeframe")}
              </label>
              <select
                id="timeframe"
                className={selectClass}
                value={form.timeframe}
                onChange={(e) =>
                  setForm(() => ({ timeframe: e.target.value as Timeframe }))
                }
              >
                {Object.values(Timeframe).map((tf) => (
                  <option key={tf} value={tf}>
                    {tf}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>{t("field.rsiLength")}</label>
              <input
                className={inputClass}
                inputMode="numeric"
                value={form.rsiLength}
                onChange={(e) => setForm(() => ({ rsiLength: e.target.value }))}
              />
            </div>
            <div>
              <label className={labelClass}>{t("field.leverage")}</label>
              <input
                className={inputClass}
                inputMode="numeric"
                value={form.leverage}
                onChange={(e) => setForm(() => ({ leverage: e.target.value }))}
              />
            </div>
            <div>
              <label className={labelClass}>{t("field.profit")}</label>
              <input
                className={inputClass}
                placeholder="%"
                inputMode="decimal"
                value={form.targetProfit}
                onChange={(e) =>
                  setForm(() => ({ targetProfit: e.target.value }))
                }
              />
            </div>
            <div>
              <label className={labelClass}>{t("field.loss")}</label>
              <input
                className={inputClass}
                placeholder="%"
                inputMode="decimal"
                value={form.targetLoss}
                onChange={(e) =>
                  setForm(() => ({ targetLoss: e.target.value }))
                }
              />
            </div>
            <div>
              <label className={labelClass}>{t("field.volatilityIndex")}</label>
              <input
                className={inputClass}
                placeholder="%"
                inputMode="decimal"
                value={form.minAtrPct}
                onChange={(e) => setForm(() => ({ minAtrPct: e.target.value }))}
              />
            </div>
          </div>

          {/* 2. 체크박스 옵션 */}
          <div className="flex flex-wrap gap-6 p-4 rounded-xl border bg-gray-50 border-gray-200 [:root[data-theme=dark]_&]:bg-[#0B1222] [:root[data-theme=dark]_&]:border-gray-700">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className={checkboxClass}
                checked={form.rangeFollowTrendOnly}
                onChange={(e) =>
                  setForm(() => ({ rangeFollowTrendOnly: e.target.checked }))
                }
              />
              <span className="text-sm text-gray-700 [:root[data-theme=dark]_&]:text-gray-300">
                {t("field.rangeFollowTrendOnly")}
              </span>
            </label>

          </div>

          {/* 3. Trend 설정 */}
          {(form.kind === StrategyKind.TREND ||
            form.kind === StrategyKind.BOTH) && (
            <div className="border-t pt-4 border-gray-200 [:root[data-theme=dark]_&]:border-gray-700">
              <h4 className="text-sm font-bold text-[#06b6d4] mb-3 uppercase">
                {t("section.trend")}
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t("field.trendUpper")}</label>
                  <input
                    className={inputClass}
                    value={form.trendRsiUpperPullback}
                    onChange={(e) =>
                      setForm(() => ({
                        trendRsiUpperPullback: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className={labelClass}>{t("field.trendLower")}</label>
                  <input
                    className={inputClass}
                    value={form.trendRsiLowerPullback}
                    onChange={(e) =>
                      setForm(() => ({
                        trendRsiLowerPullback: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {/* 4. Box 설정 */}
          {(form.kind === StrategyKind.BOX ||
            form.kind === StrategyKind.BOTH) && (
            <div className="border-t pt-4 border-gray-200 [:root[data-theme=dark]_&]:border-gray-700">
              <h4 className="text-sm font-bold text-[#06b6d4] mb-3 uppercase">
                {t("section.box")}
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>{t("field.boxUpper")}</label>
                  <input
                    className={inputClass}
                    value={form.upperTh}
                    onChange={(e) =>
                      setForm(() => ({ upperTh: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className={labelClass}>{t("field.boxLower")}</label>
                  <input
                    className={inputClass}
                    value={form.lowerTh}
                    onChange={(e) =>
                      setForm(() => ({ lowerTh: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className={labelClass}>{t("field.boxTouch")}</label>
                  <input
                    className={inputClass}
                    value={form.boxTouchPct}
                    onChange={(e) =>
                      setForm(() => ({ boxTouchPct: e.target.value }))
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {/* 5. 시그널 확증 (고급) */}
          <div className="border-t pt-4 border-gray-200 [:root[data-theme=dark]_&]:border-gray-700">
            <h4 className="text-sm font-bold text-gray-500 mb-3 uppercase">
              {t("section.signalConfirm")}
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  label: "ADX Th",
                  val: form.adxConfirmThreshold,
                  set: "adxConfirmThreshold",
                },
                {
                  label: "ATR Period",
                  val: form.atrConfirmPeriod,
                  set: "atrConfirmPeriod",
                },
                {
                  label: "Donchian N",
                  val: form.donchianLookback,
                  set: "donchianLookback",
                },
                {
                  label: "ST Period",
                  val: form.supertrendPeriod,
                  set: "supertrendPeriod",
                },
                {
                  label: "ST Mult",
                  val: form.supertrendMult,
                  set: "supertrendMult",
                },
                {
                  label: "Range ATR Mult",
                  val: form.rangeMinAtrMult,
                  set: "rangeMinAtrMult",
                },
                {
                  label: "Slope Win",
                  val: form.trendSlopeWindow,
                  set: "trendSlopeWindow",
                },
                {
                  label: "Slope Th",
                  val: form.trendSlopeThresholdAbs,
                  set: "trendSlopeThresholdAbs",
                },
                {
                  label: "Donchian Break%",
                  val: form.donchianNearBreakPct,
                  set: "donchianNearBreakPct",
                },
              ].map((f) => (
                <div key={f.label}>
                  <label className="text-[10px] text-gray-500 mb-1 block truncate">
                    {f.label}
                  </label>
                  <input
                    className="input input-xs input-bordered w-full"
                    value={f.val}
                    onChange={(e) =>
                      // [수정] as keyof CreateForm을 사용하여 타입 안전성 확보
                      setForm(() => ({
                        [f.set as keyof CreateForm]: e.target.value,
                      }))
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <div className="p-5 border-t flex justify-end gap-3 shrink-0 border-gray-200 [:root[data-theme=dark]_&]:border-gray-800">
          <button
            onClick={onClose}
            className="btn btn-primary bg-[#06b6d4] hover:bg-[#0891b2] border-none text-white w-full sm:w-auto"
          >
            {t("customModal.apply")}
          </button>
        </div>
      </div>
    </div>
  );
}
