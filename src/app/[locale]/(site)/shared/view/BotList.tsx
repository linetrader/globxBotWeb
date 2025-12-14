// src/app/(site)/shared/view/BotList.tsx
"use client";

import { useMemo } from "react";
import type { BotRow, BotStatus } from "@/app/[locale]/(site)/bot-config/types";

type PendingAction = "start" | "stop" | null;

export type BotListProps = {
  title: string;
  bots: BotRow[];
  loading: boolean;
  error?: string;
  selectedBotId: string | null;
  deletingId: string | null;
  selectedStatus?: BotStatus;
  pendingId?: string | null;
  pendingAction?: PendingAction;

  onStartSelected: () => Promise<void> | void;
  onStopSelected: () => Promise<void> | void;
  onStartBot: (id: string) => Promise<void> | void;
  onStopBot: (id: string) => Promise<void> | void;
  onSelect: (id: string | null) => void;
  onReload: () => Promise<void>;
  onDeleteSelected: () => Promise<void> | void;
};

function badgeClassByStatus(status: BotStatus | undefined): string {
  if (status === "RUNNING") return "badge-success";
  if (status === "STOPPED") return "badge-ghost";
  return "badge-warning";
}

function controlsFromStatus(status: BotStatus | undefined): {
  canStart: boolean;
  canStop: boolean;
} {
  if (status === "RUNNING") return { canStart: false, canStop: true };
  if (status === "STOPPED") return { canStart: true, canStop: false };
  // UNKNOWN 포함
  return { canStart: false, canStop: false };
}

export default function BotList(props: BotListProps) {
  const {
    title,
    bots,
    loading,
    error,
    selectedBotId,
    deletingId,
    selectedStatus,
    pendingId,
    pendingAction,
    onStartSelected,
    onStopSelected,
    onStartBot,
    onStopBot,
    onSelect,
    onReload,
    onDeleteSelected,
  } = props;

  const selectedControls = useMemo(
    () => controlsFromStatus(selectedStatus),
    [selectedStatus]
  );

  return (
    <div className="card bg-base-100 shadow w-full">
      <div className="card-body">
        {/* 헤더 + 상단 컨트롤 버튼 */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h3 className="card-title">{title}</h3>

          {/* 버튼 묶음: 모바일 랩핑 고려 */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              className="btn btn-sm btn-primary"
              onClick={() => void onStartSelected()}
              disabled={!selectedControls.canStart || loading}
            >
              선택 시작
            </button>
            <button
              className="btn btn-sm btn-warning"
              onClick={() => void onStopSelected()}
              disabled={!selectedControls.canStop || loading}
            >
              선택 종료
            </button>
            <button
              className="btn btn-sm"
              onClick={() => void onReload()}
              disabled={loading}
            >
              {loading ? "새로고침..." : "새로고침"}
            </button>
            <button
              className="btn btn-sm btn-error"
              onClick={() => void onDeleteSelected()}
              disabled={
                loading || !selectedBotId || deletingId === selectedBotId
              }
            >
              {deletingId === selectedBotId ? "삭제중..." : "선택 삭제"}
            </button>
          </div>
        </div>

        {error ? <div className="alert alert-error mt-3">{error}</div> : null}

        {/* 모바일: 카드형 리스트 (md 미만에서만 표시) */}
        <div className="mt-3 md:hidden">
          <ul className="space-y-3">
            {bots.map((b) => {
              const isSelected = selectedBotId === b.id;
              const perRow = controlsFromStatus(b.status);
              const rowDeleting = deletingId === b.id;
              const isPending = pendingId === b.id;
              const isStartPending = isPending && pendingAction === "start";
              const isStopPending = isPending && pendingAction === "stop";

              return (
                <li key={b.id} className="card bg-base-200">
                  <div className="card-body p-4">
                    {/* 상단: 선택 라디오 + 이름 + 상태 */}
                    <div className="flex items-center justify-between gap-3">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="selected-bot"
                          aria-label={`${b.name} 선택`}
                          className="radio radio-lg [--chkbg:#22d3ee] focus:outline-none focus:ring-2 focus:ring-[#22d3ee]/40"
                          checked={isSelected}
                          onChange={() => onSelect(isSelected ? null : b.id)}
                        />
                        <span className="font-semibold">{b.name}</span>
                      </label>
                      <span className={`badge ${badgeClassByStatus(b.status)}`}>
                        {b.status}
                      </span>
                    </div>

                    {/* 중간: 메타(모드/심볼) */}
                    <div className="text-sm opacity-80 mt-1">
                      <div>모드: {b.mode}</div>
                      <div>심볼: {b.symbol}</div>
                    </div>

                    {/* 하단: 행별 시작/종료 버튼 */}
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <button
                        className="btn btn-xs btn-primary"
                        onClick={() => void onStartBot(b.id)}
                        disabled={
                          !isSelected ||
                          !perRow.canStart ||
                          rowDeleting ||
                          isStopPending ||
                          loading
                        }
                      >
                        {isStartPending ? (
                          <>
                            <span className="loading loading-spinner loading-xs" />
                            시작중...
                          </>
                        ) : (
                          "시작"
                        )}
                      </button>
                      <button
                        className="btn btn-xs btn-warning"
                        onClick={() => void onStopBot(b.id)}
                        disabled={
                          !isSelected ||
                          !perRow.canStop ||
                          rowDeleting ||
                          isStartPending ||
                          loading
                        }
                      >
                        {isStopPending ? (
                          <>
                            <span className="loading loading-spinner loading-xs" />
                            종료중...
                          </>
                        ) : (
                          "종료"
                        )}
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
            {loading ? (
              <li className="flex justify-center p-3">
                <span className="loading loading-spinner loading-sm" />
              </li>
            ) : null}
            {!loading && bots.length === 0 ? (
              <li className="text-sm opacity-70">등록된 봇이 없습니다.</li>
            ) : null}
          </ul>
        </div>

        {/* 데스크탑: 테이블 (md 이상에서만 표시) */}
        <div className="mt-3 hidden md:block">
          <div className="overflow-x-auto">
            <table className="table table-zebra table-sm w-full">
              <thead>
                <tr>
                  <th style={{ width: "48px" }}></th>
                  <th>이름</th>
                  <th style={{ width: "100px" }}>모드</th>
                  <th style={{ width: "120px" }}>심볼</th>
                  <th style={{ width: "110px" }}>상태</th>
                  <th className="text-right" style={{ width: "170px" }}>
                    액션
                  </th>
                </tr>
              </thead>
              <tbody>
                {bots.map((b) => {
                  const isSelected = selectedBotId === b.id;
                  const perRow = controlsFromStatus(b.status);
                  const rowDeleting = deletingId === b.id;
                  const isPending = pendingId === b.id;
                  const isStartPending = isPending && pendingAction === "start";
                  const isStopPending = isPending && pendingAction === "stop";

                  return (
                    <tr key={b.id} className="hover">
                      <td>
                        <input
                          type="radio"
                          name="selected-bot"
                          aria-label={`${b.name} 선택`}
                          className="radio [--chkbg:#22d3ee] focus:outline-none focus:ring-2 focus:ring-[#22d3ee]/40"
                          checked={isSelected}
                          onChange={() => onSelect(isSelected ? null : b.id)}
                        />
                      </td>
                      <td className="whitespace-nowrap">{b.name}</td>
                      <td className="whitespace-nowrap">{b.mode}</td>
                      <td className="whitespace-nowrap">{b.symbol}</td>
                      <td>
                        <span
                          className={`badge ${badgeClassByStatus(b.status)}`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-2 justify-end">
                          <button
                            className="btn btn-xs btn-primary"
                            onClick={() => void onStartBot(b.id)}
                            disabled={
                              !isSelected ||
                              !perRow.canStart ||
                              rowDeleting ||
                              isStopPending ||
                              loading
                            }
                          >
                            {isStartPending ? (
                              <>
                                <span className="loading loading-spinner loading-xs" />
                                시작중...
                              </>
                            ) : (
                              "시작"
                            )}
                          </button>
                          <button
                            className="btn btn-xs btn-warning"
                            onClick={() => void onStopBot(b.id)}
                            disabled={
                              !isSelected ||
                              !perRow.canStop ||
                              rowDeleting ||
                              isStartPending ||
                              loading
                            }
                          >
                            {isStopPending ? (
                              <>
                                <span className="loading loading-spinner loading-xs" />
                                종료중...
                              </>
                            ) : (
                              "종료"
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {loading ? (
                  <tr>
                    <td colSpan={6}>
                      <div className="flex justify-center p-3">
                        <span className="loading loading-spinner loading-sm" />
                      </div>
                    </td>
                  </tr>
                ) : null}
                {!loading && bots.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-sm opacity-70">
                      등록된 봇이 없습니다.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
