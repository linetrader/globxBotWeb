// src/app/(site)/strategy-config/view/EditStrategyFormView.tsx
"use client";

import { ChangeEvent } from "react";
import { StrategyKind } from "@/generated/prisma";
import type { EditForm } from "../types/common";
import CommonSettingsSectionView from "./CommonSettingsSectionView";

type Props = {
  form: EditForm;
  setForm: (updater: (prev: EditForm) => EditForm) => void;
  updating: boolean;
  disabled?: boolean;
  onUpdateClick: () => void;
  onClose: () => void;
};

export default function EditStrategyFormView({
  form,
  setForm,
  updating,
  disabled = false,
  onUpdateClick,
  onClose,
}: Props) {
  const showTrend =
    form.kind === StrategyKind.TREND || form.kind === StrategyKind.BOTH;
  const showBox =
    form.kind === StrategyKind.BOX || form.kind === StrategyKind.BOTH;

  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body space-y-6">
        <h2 className="text-base font-semibold">전략 수정</h2>

        {/* ID 읽기전용 */}
        <section className="rounded-2xl border border-base-300 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="form-control">
              <label htmlFor="id" className="label">
                <span className="label-text">아이디</span>
              </label>
              <input
                id="id"
                className="input input-bordered"
                readOnly
                value={form.id}
              />
            </div>
          </div>
        </section>

        <CommonSettingsSectionView
          form={form}
          setForm={(u) => setForm((prev) => ({ ...prev, ...u(prev) }))}
          disabled={updating || disabled}
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
              <div className="form-control">
                <label htmlFor="trend-lower" className="label">
                  <span className="label-text">트렌드 풀백 하단</span>
                </label>
                <input
                  id="trend-lower"
                  className="input input-bordered"
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
                  disabled={updating || disabled}
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
                  disabled={updating || disabled}
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
                  disabled={updating || disabled}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setForm((s) => ({ ...s, boxTouchPct: e.target.value }))
                  }
                />
              </div>
            </div>
          </section>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            className="btn btn-primary"
            disabled={updating || disabled}
            onClick={onUpdateClick}
          >
            {updating ? "수정 중…" : "수정 저장"}
          </button>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
