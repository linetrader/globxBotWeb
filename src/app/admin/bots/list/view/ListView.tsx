// src/app/admin/bots/list/view/ListView.tsx
"use client";

import { useRouter } from "next/navigation";
import type { UseBotsListReturn, BotRow, RunningFilter } from "../types";

function ModeBadge(props: { mode: "SINGLE" | "MULTI" }) {
  const { mode } = props;
  return (
    <div
      className={`badge ${
        mode === "SINGLE" ? "badge-info" : "badge-secondary"
      }`}
    >
      {mode}
    </div>
  );
}

function StatusBadge(props: { status: BotRow["status"]; running: boolean }) {
  const { status, running } = props;
  const cls =
    status === "ERROR"
      ? "badge-error"
      : running
        ? "badge-success"
        : "badge-ghost";
  return <div className={`badge ${cls}`}>{status}</div>;
}

function HeaderControls(props: {
  allChecked: boolean;
  onToggleAll: (checked: boolean) => void;
  onRefresh: () => void;
  onStart: () => void;
  onStop: () => void;
  starting: boolean;
  stopping: boolean;
  runningFilter: RunningFilter;
  setRunningFilter: (f: RunningFilter) => void;

  usernameInput: string;
  setUsernameInput: (v: string) => void;
  applyUsernameFilter: () => void;

  // 신규: 백업/복원
  onBackupStop: () => void;
  onRestoreStart: () => void;
  backingUpStopping: boolean;
  restoring: boolean;
}) {
  const {
    allChecked,
    onToggleAll,
    onRefresh,
    onStart,
    onStop,
    starting,
    stopping,
    runningFilter,
    setRunningFilter,
    usernameInput,
    setUsernameInput,
    applyUsernameFilter,
    onBackupStop,
    onRestoreStart,
    backingUpStopping,
    restoring,
  } = props;

  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="flex flex-wrap items-center gap-3">
        {/* 전체 선택 */}
        <label className="label cursor-pointer">
          <span className="label-text mr-2">전체 선택</span>
          <input
            type="checkbox"
            className="checkbox"
            checked={allChecked}
            onChange={(e) => onToggleAll(e.currentTarget.checked)}
          />
        </label>

        {/* 러닝상태 필터 */}
        <div className="flex items-center gap-2">
          <span className="text-sm">러닝상태</span>
          <select
            className="select select-bordered select-sm"
            value={runningFilter}
            onChange={(e) =>
              setRunningFilter(e.currentTarget.value as RunningFilter)
            }
          >
            <option value="ALL">ALL</option>
            <option value="RUNNING">RUNNING</option>
            <option value="STOPPED">STOPPED</option>
            <option value="ERROR">ERROR</option>
          </select>
        </div>

        {/* 유저네임 검색 */}
        <div className="flex items-center gap-2">
          <span className="text-sm">유저 검색</span>
          <input
            type="text"
            className="input input-bordered input-sm"
            placeholder="username 부분검색"
            value={usernameInput}
            onChange={(e) => {
              setUsernameInput(e.currentTarget.value);
            }}
          />
          <button className="btn btn-sm" onClick={applyUsernameFilter}>
            검색
          </button>
        </div>

        <button className="btn btn-sm" onClick={onRefresh}>
          새로고침
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          className={`btn btn-outline btn-sm ${
            backingUpStopping ? "btn-disabled" : ""
          }`}
          onClick={onBackupStop}
          disabled={backingUpStopping}
          title="현재 RUNNING 봇을 백업하고 모두 종료합니다"
        >
          {backingUpStopping ? "백업·종료 중..." : "백업 + 전체 종료"}
        </button>

        <button
          className={`btn btn-outline btn-sm ${
            restoring ? "btn-disabled" : ""
          }`}
          onClick={onRestoreStart}
          disabled={restoring}
          title="최근 백업을 기준으로 1초 간격으로 순차 시작"
        >
          {restoring ? "복원 시작 중..." : "백업 복원 시작"}
        </button>

        <div className="divider divider-horizontal m-0" />

        <button
          className={`btn btn-primary btn-sm ${starting ? "btn-disabled" : ""}`}
          onClick={onStart}
          disabled={starting}
        >
          {starting ? "시작 중..." : "선택 시작"}
        </button>
        <button
          className={`btn btn-sm ${stopping ? "btn-disabled" : ""}`}
          onClick={onStop}
          disabled={stopping}
        >
          {stopping ? "종료 중..." : "선택 종료"}
        </button>
      </div>
    </div>
  );
}

function BotsTable(props: {
  rows: BotRow[];
  selected: Record<string, boolean>;
  onToggle: (botId: string) => void;
  onRowClick: (botId: string) => void;
}) {
  const { rows, selected, onToggle, onRowClick } = props;

  const headerCells = [
    <th key="_sel" />,
    <th key="worker">worker</th>,
    <th key="username">username</th>,
    <th key="name">name</th>,
    <th key="mode">mode</th>,
    <th key="status">러닝상태</th>,
  ];

  return (
    <div className="overflow-x-auto">
      <table className="table table-zebra w-full">
        <thead>
          <tr>{headerCells}</tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const checked = selected[r.id] === true;
            return (
              <tr
                key={r.id}
                className="cursor-pointer hover:bg-base-200"
                onClick={() => onRowClick(r.id)}
              >
                <td
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggle(r.id);
                  }}
                >
                  <input
                    type="checkbox"
                    className="checkbox"
                    checked={checked}
                    onChange={() => {
                      /* 위의 onClick에서 처리 */
                    }}
                  />
                </td>
                <td className="text-xs text-gray-400">{r.workerId ?? "-"}</td>
                <td>{r.username}</td>
                <td>{r.name}</td>
                <td>
                  <ModeBadge mode={r.mode} />
                </td>
                <td>
                  <StatusBadge status={r.status} running={r.running} />
                </td>
              </tr>
            );
          })}
          {rows.length === 0 && (
            <tr>
              <td colSpan={6} className="text-center">
                데이터가 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function Pagination(props: {
  page: number;
  pageSize: number;
  total: number;
  setPage: (p: number) => void;
}) {
  const { page, pageSize, total, setPage } = props;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const prev = () => setPage(Math.max(1, page - 1));
  const next = () => setPage(Math.min(totalPages, page + 1));

  return (
    <div className="flex items-center justify-center gap-2 mt-3">
      <button className="btn btn-sm" onClick={prev} disabled={page <= 1}>
        « 이전
      </button>
      <span className="text-sm">
        {page} / {totalPages} (총 {total}개)
      </span>
      <button
        className="btn btn-sm"
        onClick={next}
        disabled={page >= totalPages}
      >
        다음 »
      </button>
    </div>
  );
}

export default function ListView(props: UseBotsListReturn) {
  const {
    loading,
    error,
    rows,
    selected,
    toggleOne,
    toggleAll,
    refresh,
    starting,
    stopping,
    startSelected,
    stopSelected,
    page,
    pageSize,
    total,
    setPage,
    runningFilter,
    setRunningFilter,
    usernameInput,
    setUsernameInput,
    applyUsernameFilter,
    backingUpStopping,
    restoring,
    backupAndStopAll,
    restoreBackupStart,
  } = props;

  const router = useRouter();

  const allChecked = rows.length > 0 && rows.every((r) => selected[r.id]);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">어드민 · 봇 리스트</h1>

      <HeaderControls
        allChecked={allChecked}
        onToggleAll={toggleAll}
        onRefresh={refresh}
        onStart={startSelected}
        onStop={stopSelected}
        starting={starting}
        stopping={stopping}
        runningFilter={runningFilter}
        setRunningFilter={setRunningFilter}
        usernameInput={usernameInput}
        setUsernameInput={setUsernameInput}
        applyUsernameFilter={applyUsernameFilter}
        onBackupStop={backupAndStopAll}
        onRestoreStart={restoreBackupStart}
        backingUpStopping={backingUpStopping}
        restoring={restoring}
      />

      {error && (
        <div className="alert alert-error mt-2">
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2">
          <span className="loading loading-spinner loading-md" />
          <span>불러오는 중…</span>
        </div>
      ) : (
        <>
          <BotsTable
            rows={rows}
            selected={selected}
            onToggle={toggleOne}
            onRowClick={(botId) => {
              router.push(`/admin/bots/${botId}`);
            }}
          />
          <Pagination
            page={page}
            pageSize={pageSize}
            total={total}
            setPage={setPage}
          />
        </>
      )}
    </div>
  );
}
