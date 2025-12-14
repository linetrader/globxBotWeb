// src/app/(site)/strategy-config/view/CommonSettingsSectionView.tsx
"use client";

import { ChangeEvent } from "react";
import { Timeframe, StrategyKind } from "@/generated/prisma";
import type { CommonFormSlice } from "../types/common";

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

export default function CommonSettingsSectionView({
  form,
  setForm,
  timeframeOptions = DEFAULT_TF_OPTIONS,
  strategyKindOptions = DEFAULT_KIND_OPTIONS,
  disabled = false,
}: Props) {
  return (
    <section className="rounded-2xl border border-base-300 p-4">
      <h3 className="mb-3 text-sm font-semibold">공통 설정</h3>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {/* 이름 */}
        <div className="form-control">
          <label htmlFor="name" className="label">
            <span className="label-text">이름</span>
          </label>
          <input
            id="name"
            className="input input-bordered"
            placeholder="전략 이름"
            value={form.name}
            disabled={disabled}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setForm(() => ({ name: e.target.value }))
            }
          />
        </div>

        {/* 전략 종류 */}
        <div className="form-control">
          <label htmlFor="kind" className="label">
            <span className="label-text">전략 종류</span>
          </label>
          <select
            id="kind"
            className="select select-bordered"
            value={form.kind}
            disabled={disabled}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
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

        {/* RSI 길이(공통) */}
        <div className="form-control">
          <label htmlFor="rsi-length" className="label">
            <span className="label-text">분봉 분석 갯수</span>
          </label>
          <input
            id="rsi-length"
            className="input input-bordered"
            inputMode="numeric"
            value={form.rsiLength}
            disabled={disabled}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setForm(() => ({ rsiLength: e.target.value }))
            }
          />
        </div>

        {/* 타임프레임 */}
        <div className="form-control">
          <label htmlFor="timeframe" className="label">
            <span className="label-text">타임프레임</span>
          </label>
          <select
            id="timeframe"
            className="select select-bordered"
            value={form.timeframe}
            disabled={disabled}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
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

        {/* 목표 수익률 / 손절 (%) */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">목표 수익률 / 손절 (%)</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              id="target-profit"
              className="input input-bordered"
              placeholder="수익 % (실수)"
              inputMode="decimal"
              value={form.targetProfit}
              disabled={disabled}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setForm(() => ({ targetProfit: e.target.value }))
              }
            />
            <input
              id="target-loss"
              className="input input-bordered"
              placeholder="손절 % (실수)"
              inputMode="decimal"
              value={form.targetLoss}
              disabled={disabled}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setForm(() => ({ targetLoss: e.target.value }))
              }
            />
          </div>
        </div>

        {/* 레버리지 */}
        <div className="form-control">
          <label htmlFor="leverage" className="label">
            <span className="label-text">레버리지 (배)</span>
          </label>
          <input
            id="leverage"
            className="input input-bordered"
            placeholder="정수"
            inputMode="numeric"
            value={form.leverage}
            disabled={disabled}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setForm(() => ({ leverage: e.target.value }))
            }
          />
        </div>

        {/* 기본 수량 / 최대 수량 */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">기본 수량 / 최대 수량 (USDT)</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              id="default-size"
              className="input input-bordered"
              placeholder="정수"
              inputMode="numeric"
              value={form.defaultSize}
              disabled={disabled}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setForm(() => ({ defaultSize: e.target.value }))
              }
            />
            <input
              id="max-size"
              className="input input-bordered"
              placeholder="정수"
              inputMode="numeric"
              value={form.maxSize}
              disabled={disabled}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setForm(() => ({ maxSize: e.target.value }))
              }
            />
          </div>
        </div>

        {/* 마틴 / Range / 리버스 진입 토글들 */}
        <div className="md:col-span-2 flex flex-wrap gap-x-6 gap-y-2">
          <label className="label cursor-pointer gap-2">
            <input
              type="checkbox"
              className="checkbox checkbox-sm"
              checked={form.useMartin}
              disabled={disabled}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setForm(() => ({ useMartin: e.target.checked }))
              }
            />
            <span className="label-text">마틴 사용</span>
          </label>

          <label className="label cursor-pointer gap-2">
            <input
              type="checkbox"
              className="checkbox checkbox-sm"
              checked={form.rangeFollowTrendOnly}
              disabled={disabled}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setForm(() => ({ rangeFollowTrendOnly: e.target.checked }))
              }
            />
            <span className="label-text">박스 시그널은 추세 방향만 허용</span>
          </label>

          <label className="label cursor-pointer gap-2">
            <input
              type="checkbox"
              className="checkbox checkbox-sm"
              checked={form.reverseEntryEnabled}
              disabled={disabled}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setForm(() => ({ reverseEntryEnabled: e.target.checked }))
              }
            />
            <span className="label-text">리버스 진입 허용</span>
          </label>
        </div>

        {/* 마틴 배수 */}
        <div className="form-control">
          <label htmlFor="martin-multiplier" className="label">
            <span className="label-text">마틴 배수</span>
          </label>
          <input
            id="martin-multiplier"
            className="input input-bordered"
            placeholder="실수"
            inputMode="decimal"
            value={form.martinMultiplier}
            disabled={disabled}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setForm(() => ({ martinMultiplier: e.target.value }))
            }
          />
        </div>

        {/* ──────────────────────────────── */}
        {/* 시그널 확증/보조 파라미터 섹션 */}
        {/* ──────────────────────────────── */}

        <div className="md:col-span-2 mt-4 border-t border-base-300 pt-3">
          <h4 className="mb-2 text-xs font-semibold text-base-content/70">
            시그널 확증 / 보조 파라미터
          </h4>
        </div>

        {/* ADX / ATR / 최소 ATR% */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">
              ADX 임계값 / ATR 기간 / 최소 ATR%
            </span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            <input
              id="adx-confirm-th"
              className="input input-bordered"
              placeholder="ADX 임계값"
              inputMode="decimal"
              value={form.adxConfirmThreshold}
              disabled={disabled}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setForm(() => ({ adxConfirmThreshold: e.target.value }))
              }
            />
            <input
              id="atr-confirm-period"
              className="input input-bordered"
              placeholder="ATR 기간"
              inputMode="numeric"
              value={form.atrConfirmPeriod}
              disabled={disabled}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setForm(() => ({ atrConfirmPeriod: e.target.value }))
              }
            />
            <input
              id="min-atr-pct"
              className="input input-bordered"
              placeholder="최소 ATR% "
              inputMode="decimal"
              value={form.minAtrPct}
              disabled={disabled}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setForm(() => ({ minAtrPct: e.target.value }))
              }
            />
          </div>
        </div>

        {/* Donchian / Supertrend(Period/Mult) */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Donchian N / ST 기간 / ST 배수</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            <input
              id="donchian-lookback"
              className="input input-bordered"
              placeholder="Donchian N"
              inputMode="numeric"
              value={form.donchianLookback}
              disabled={disabled}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setForm(() => ({ donchianLookback: e.target.value }))
              }
            />
            <input
              id="supertrend-period"
              className="input input-bordered"
              placeholder="ST Period"
              inputMode="numeric"
              value={form.supertrendPeriod}
              disabled={disabled}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setForm(() => ({ supertrendPeriod: e.target.value }))
              }
            />
            <input
              id="supertrend-mult"
              className="input input-bordered"
              placeholder="ST Mult"
              inputMode="decimal"
              value={form.supertrendMult}
              disabled={disabled}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setForm(() => ({ supertrendMult: e.target.value }))
              }
            />
          </div>
        </div>

        {/* Range 최소 ATR 배수 */}
        <div className="form-control">
          <label htmlFor="range-min-atr-mult" className="label">
            <span className="label-text">Range 최소 ATR 배수</span>
          </label>
          <input
            id="range-min-atr-mult"
            className="input input-bordered"
            placeholder="0 이상 실수"
            inputMode="decimal"
            value={form.rangeMinAtrMult}
            disabled={disabled}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setForm(() => ({ rangeMinAtrMult: e.target.value }))
            }
          />
        </div>

        {/* 추세 기울기 / Donchian 근접 % */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">
              Slope 윈도우 / Slope 기준 / 근접 %
            </span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            <input
              id="trend-slope-window"
              className="input input-bordered"
              placeholder="Slope 윈도우"
              inputMode="numeric"
              value={form.trendSlopeWindow}
              disabled={disabled}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setForm(() => ({ trendSlopeWindow: e.target.value }))
              }
            />
            <input
              id="trend-slope-th-abs"
              className="input input-bordered"
              placeholder="Slope 기준(비율)"
              inputMode="decimal"
              value={form.trendSlopeThresholdAbs}
              disabled={disabled}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setForm(() => ({ trendSlopeThresholdAbs: e.target.value }))
              }
            />
            <input
              id="donchian-near-break"
              className="input input-bordered"
              placeholder="근접 %"
              inputMode="decimal"
              value={form.donchianNearBreakPct}
              disabled={disabled}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setForm(() => ({ donchianNearBreakPct: e.target.value }))
              }
            />
          </div>
        </div>
      </div>
    </section>
  );
}
