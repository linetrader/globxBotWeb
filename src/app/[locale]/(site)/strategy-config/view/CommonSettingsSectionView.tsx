"use client";

// [수정] ChangeEvent 제거
import { Timeframe, StrategyKind } from "@/generated/prisma";
import type { CommonFormSlice } from "../types/common";
import { useTranslations } from "next-intl";

type Props = {
  form: CommonFormSlice;
  setForm: (
    updater: (prev: CommonFormSlice) => Partial<CommonFormSlice>
  ) => void;
  timeframeOptions?: readonly Timeframe[];
  strategyKindOptions?: readonly StrategyKind[];
  disabled?: boolean;
};

const DEFAULT_TF_OPTIONS: readonly Timeframe[] = Object.values(Timeframe);
const DEFAULT_KIND_OPTIONS: readonly StrategyKind[] = [
  StrategyKind.TREND,
  StrategyKind.BOX,
  StrategyKind.BOTH,
] as const;

// 공통 스타일 (라이트/다크 분기)
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

export default function CommonSettingsSectionView({
  form,
  setForm,
  timeframeOptions = DEFAULT_TF_OPTIONS,
  strategyKindOptions = DEFAULT_KIND_OPTIONS,
  disabled = false,
}: Props) {
  const t = useTranslations("strategy-config");

  return (
    <section>
      <h3 className="text-sm font-bold text-[#06b6d4] mb-4 uppercase tracking-wider">
        {t("section.common")}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="col-span-1 md:col-span-2">
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
        </div>
        <div>
          <label htmlFor="kind" className={labelClass}>
            {t("field.kind")}
          </label>
          <select
            id="kind"
            className={selectClass}
            value={form.kind}
            disabled={disabled}
            onChange={(e) =>
              setForm(() => ({ kind: e.target.value as StrategyKind }))
            }
          >
            {strategyKindOptions.map((k) => (
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
            disabled={disabled}
            onChange={(e) =>
              setForm(() => ({ timeframe: e.target.value as Timeframe }))
            }
          >
            {timeframeOptions.map((tf) => (
              <option key={tf} value={tf}>
                {tf}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="rsi-length" className={labelClass}>
            {t("field.rsiLength")}
          </label>
          <input
            id="rsi-length"
            className={inputClass}
            inputMode="numeric"
            value={form.rsiLength}
            disabled={disabled}
            onChange={(e) => setForm(() => ({ rsiLength: e.target.value }))}
          />
        </div>
        <div>
          <label htmlFor="leverage" className={labelClass}>
            {t("field.leverage")}
          </label>
          <input
            id="leverage"
            className={inputClass}
            inputMode="numeric"
            value={form.leverage}
            disabled={disabled}
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
            disabled={disabled}
            onChange={(e) => setForm(() => ({ targetProfit: e.target.value }))}
          />
        </div>
        <div>
          <label className={labelClass}>{t("field.loss")}</label>
          <input
            className={inputClass}
            placeholder="%"
            inputMode="decimal"
            value={form.targetLoss}
            disabled={disabled}
            onChange={(e) => setForm(() => ({ targetLoss: e.target.value }))}
          />
        </div>
        <div>
          <label className={labelClass}>{t("field.defaultSize")}</label>
          <input
            className={inputClass}
            inputMode="numeric"
            value={form.defaultSize}
            disabled={disabled}
            onChange={(e) => setForm(() => ({ defaultSize: e.target.value }))}
          />
        </div>
        <div>
          <label className={labelClass}>{t("field.maxSize")}</label>
          <input
            className={inputClass}
            inputMode="numeric"
            value={form.maxSize}
            disabled={disabled}
            onChange={(e) => setForm(() => ({ maxSize: e.target.value }))}
          />
        </div>
      </div>

      <div className="rounded-xl border p-4 mb-6 flex flex-wrap gap-6 bg-gray-50 border-gray-200 [:root[data-theme=dark]_&]:bg-[#0B1222] [:root[data-theme=dark]_&]:border-gray-800">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            className={checkboxClass}
            checked={form.useMartin}
            disabled={disabled}
            onChange={(e) => setForm(() => ({ useMartin: e.target.checked }))}
          />
          <span className="text-sm font-medium text-gray-700 [:root[data-theme=dark]_&]:text-gray-300">
            {t("field.useMartin")}
          </span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            className={checkboxClass}
            checked={form.rangeFollowTrendOnly}
            disabled={disabled}
            onChange={(e) =>
              setForm(() => ({ rangeFollowTrendOnly: e.target.checked }))
            }
          />
          <span className="text-sm font-medium text-gray-700 [:root[data-theme=dark]_&]:text-gray-300">
            {t("field.rangeFollowTrendOnly")}
          </span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            className={checkboxClass}
            checked={form.reverseEntryEnabled}
            disabled={disabled}
            onChange={(e) =>
              setForm(() => ({ reverseEntryEnabled: e.target.checked }))
            }
          />
          <span className="text-sm font-medium text-gray-700 [:root[data-theme=dark]_&]:text-gray-300">
            {t("field.reverseEntry")}
          </span>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {form.useMartin && (
          <div>
            <label className={labelClass}>{t("field.martinMultiplier")}</label>
            <input
              className={inputClass}
              inputMode="decimal"
              value={form.martinMultiplier}
              disabled={disabled}
              onChange={(e) =>
                setForm(() => ({ martinMultiplier: e.target.value }))
              }
            />
          </div>
        )}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200 [:root[data-theme=dark]_&]:border-gray-800">
        <h4 className="text-xs font-bold text-gray-500 mb-4 uppercase">
          {t("section.signalConfirm")}
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {[
            {
              id: "adx",
              label: "ADX Threshold",
              val: form.adxConfirmThreshold,
              set: "adxConfirmThreshold" as const, // [수정] as const 추가
            },
            {
              id: "atr-p",
              label: "ATR Period",
              val: form.atrConfirmPeriod,
              set: "atrConfirmPeriod" as const,
            },
            {
              id: "atr-min",
              label: "Min ATR%",
              val: form.minAtrPct,
              set: "minAtrPct" as const,
            },
            {
              id: "don-n",
              label: "Donchian N",
              val: form.donchianLookback,
              set: "donchianLookback" as const,
            },
            {
              id: "st-p",
              label: "ST Period",
              val: form.supertrendPeriod,
              set: "supertrendPeriod" as const,
            },
            {
              id: "st-m",
              label: "ST Mult",
              val: form.supertrendMult,
              set: "supertrendMult" as const,
            },
            {
              id: "rg-atr",
              label: "Range ATR Mult",
              val: form.rangeMinAtrMult,
              set: "rangeMinAtrMult" as const,
            },
            {
              id: "sl-w",
              label: "Slope Window",
              val: form.trendSlopeWindow,
              set: "trendSlopeWindow" as const,
            },
            {
              id: "sl-th",
              label: "Slope Th",
              val: form.trendSlopeThresholdAbs,
              set: "trendSlopeThresholdAbs" as const,
            },
            {
              id: "dc-br",
              label: "Donchian Break%",
              val: form.donchianNearBreakPct,
              set: "donchianNearBreakPct" as const,
            },
          ].map((field) => (
            <div key={field.id}>
              <label
                htmlFor={field.id}
                className="text-[10px] text-gray-500 mb-1 block truncate"
                title={field.label}
              >
                {field.label}
              </label>
              <input
                id={field.id}
                className="input input-xs input-bordered w-full transition-colors bg-white border-gray-300 text-gray-900 focus:border-[#06b6d4] [:root[data-theme=dark]_&]:bg-[#0B1222] [:root[data-theme=dark]_&]:border-gray-700 [:root[data-theme=dark]_&]:text-gray-300"
                value={field.val}
                disabled={disabled}
                onChange={(e) =>
                  // [수정] any 제거
                  setForm(() => ({ [field.set]: e.target.value }))
                }
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
