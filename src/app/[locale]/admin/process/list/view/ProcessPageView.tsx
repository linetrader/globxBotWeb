// src/app/admin/process/list/view/ProcessPageView.tsx
"use client";

import { useCallback } from "react";
import type { UseProcessListReturn, AliveFilter, ProcessRow } from "../types";
import ProcessTable from "./ProcessTable";

type ProcessPageViewProps = UseProcessListReturn;

function ProcessPageView(props: ProcessPageViewProps) {
  const {
    loading,
    error,
    rows,
    page,
    pageSize,
    total,
    setPage,
    aliveFilter,
    setAliveFilter,
    refresh,

    idsSelected,
    toggleAll,
    deleting,
    deleteSelected,

    staleDeletableCount,
    deleteAllStale,

    stopLoadingMap,
    stopAllBotsForWorker,
  } = props;

  const onFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const v = e.target.value as AliveFilter;
      setAliveFilter(v);
    },
    [setAliveFilter]
  );

  const onApplyClick = useCallback(() => {
    refresh();
  }, [refresh]);

  const onToggleAllClick = useCallback(() => {
    toggleAll(rows as ProcessRow[]);
  }, [toggleAll, rows]);

  const onDeleteAllStaleClick = useCallback(() => {
    deleteAllStale();
  }, [deleteAllStale]);

  return (
    <main className="p-4 flex flex-col gap-4">
      {/* Header / Controls */}
      <section className="card bg-base-100 shadow-md">
        <div className="card-body flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h2 className="card-title text-lg font-bold">
                Worker Process 관리
              </h2>
              <p className="text-sm text-base-content/70">
                현재 실행 중인 WorkerManager 프로세스 상태 모니터링 및 STALE
                프로세스 정리.
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-2 items-start md:items-end">
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-sm font-semibold">
                    상태 필터
                  </span>
                </label>
                <select
                  className="select select-bordered select-sm"
                  value={aliveFilter}
                  onChange={onFilterChange}
                >
                  <option value="ALL">ALL</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="STALE">STALE</option>
                </select>
              </div>

              <button className="btn btn-sm btn-outline" onClick={onApplyClick}>
                필터 적용
              </button>

              <button className="btn btn-sm btn-primary" onClick={refresh}>
                새로고침
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="text-sm text-base-content/70">
              선택됨 {idsSelected.length}개 / STALE {staleDeletableCount}개
            </div>

            <div className="flex flex-row flex-wrap gap-2">
              <button
                className="btn btn-xs btn-outline"
                onClick={onToggleAllClick}
              >
                전체선택/해제
              </button>

              <button
                className="btn btn-xs btn-error"
                disabled={deleting}
                onClick={deleteSelected}
              >
                {deleting ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : null}
                <span>선택삭제(STALE만)</span>
              </button>

              <button
                className="btn btn-xs btn-warning"
                disabled={deleting}
                onClick={onDeleteAllStaleClick}
              >
                {deleting ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : null}
                <span>STALE 전체삭제</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Table */}
      <ProcessTable
        loading={loading}
        error={error}
        rows={rows}
        page={page}
        pageSize={pageSize}
        total={total}
        setPage={setPage}
        refresh={refresh}
        idsSelected={idsSelected}
        toggleOne={props.toggleOne}
        stopLoadingMap={stopLoadingMap}
        stopAllBotsForWorker={stopAllBotsForWorker}
      />
    </main>
  );
}

export default ProcessPageView;
