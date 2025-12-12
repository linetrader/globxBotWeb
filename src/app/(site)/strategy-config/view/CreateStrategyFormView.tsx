// src/app/(site)/strategy-config/view/CreateStrategyFormView.tsx
"use client";

import { ChangeEvent } from "react";
import { StrategyKind } from "@/generated/prisma";
import type { CreateForm } from "../types/common";
import CommonSettingsSectionView from "./CommonSettingsSectionView";

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
  const showTrend =
    form.kind === StrategyKind.TREND || form.kind === StrategyKind.BOTH;
  const showBox =
    form.kind === StrategyKind.BOX || form.kind === StrategyKind.BOTH;

  return (
    <div className="card mb-4 bg-base-100 shadow">
      <div className="card-body space-y-6">
        <h2 className="text-base font-semibold">새 전략 생성</h2>

        <CommonSettingsSectionView
          form={form}
          setForm={(u) => setForm((prev) => ({ ...prev, ...u(prev) }))}
          disabled={creating}
        />

        {showTrend && (
          <section className="rounded-2xl border border-base-300 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold">트렌드 설정</h3>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="form-control">
                <label htmlFor="trend-upper" className="label">
                  <span className="label-text">트렌드 풀백 상단</span>
                </label>
                <input
                  id="trend-upper"
                  className="input input-bordered"
                  placeholder="실수 또는 공란(null)"
                  inputMode="decimal"
                  value={form.trendRsiUpperPullback}
                  disabled={creating}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setForm((s) => ({
                      ...s,
                      trendRsiUpperPullback: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="form-control">
                <label htmlFor="trend-lower" className="label">
                  <span className="label-text">트렌드 풀백 하단</span>
                </label>
                <input
                  id="trend-lower"
                  className="input input-bordered"
                  placeholder="실수 또는 공란(null)"
                  inputMode="decimal"
                  value={form.trendRsiLowerPullback}
                  disabled={creating}
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

        {showBox && (
          <section className="rounded-2xl border border-base-300 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold">박스 설정</h3>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="form-control">
                <label htmlFor="box-upper" className="label">
                  <span className="label-text">상단</span>
                </label>
                <input
                  id="box-upper"
                  className="input input-bordered"
                  inputMode="decimal"
                  value={form.upperTh}
                  disabled={creating}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setForm((s) => ({ ...s, upperTh: e.target.value }))
                  }
                />
              </div>

              <div className="form-control">
                <label htmlFor="box-lower" className="label">
                  <span className="label-text">하단</span>
                </label>
                <input
                  id="box-lower"
                  className="input input-bordered"
                  inputMode="decimal"
                  value={form.lowerTh}
                  disabled={creating}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setForm((s) => ({ ...s, lowerTh: e.target.value }))
                  }
                />
              </div>
              <div className="form-control">
                <label htmlFor="box-touch" className="label">
                  <span className="label-text">박스 터치 %</span>
                </label>
                <input
                  id="box-touch"
                  className="input input-bordered"
                  placeholder="실수 또는 공란(null)"
                  inputMode="decimal"
                  value={form.boxTouchPct}
                  disabled={creating}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setForm((s) => ({ ...s, boxTouchPct: e.target.value }))
                  }
                />
              </div>
            </div>
          </section>
        )}

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="btn btn-primary"
            disabled={creating}
            onClick={onCreateClick}
          >
            {creating ? "생성 중…" : "생성"}
          </button>
          {error && <p className="text-xs text-error">{error}</p>}
        </div>
      </div>
    </div>
  );
}
