// src/app/admin/process/list/view/ProcessTable.tsx
// src/app/admin/process/list/view/ProcessTable.tsx
"use client";

import { useCallback, useMemo, useState, Fragment } from "react";

import type { ProcessRow, WorkerBotRow, WorkerBotListResponse } from "../types";

interface ProcessTableProps {
  loading: boolean;
  error: string | null;

  rows: ProcessRow[];

  page: number;
  pageSize: number;
  total: number;
  setPage: (page: number) => void;

  refresh: () => void;

  idsSelected: string[];
  toggleOne: (id: string) => void;

  stopLoadingMap: Record<string, boolean>;
  stopAllBotsForWorker: (workerId: string) => Promise<void>;
}

/**
 * 상태 뱃지
 */
function StatusBadge(props: { alive: boolean; isZombieSuspect: boolean }) {
  const { alive, isZombieSuspect } = props;

  const baseCls = alive ? "badge badge-success" : "badge badge-error";

  return (
    <div className="flex flex-col gap-1">
      <div className={baseCls}>{alive ? "ACTIVE" : "STALE"}</div>
      {alive && isZombieSuspect ? (
        <div className="badge badge-warning badge-outline text-[10px]">
          ZOMBIE?
        </div>
      ) : null}
    </div>
  );
}

/**
 * 날짜 포맷 (ISO -> "YYYY-MM-DD hh:mm:ss.mmm")
 */
function formatIso(iso: string | null): string {
  if (!iso) return "-";
  return iso.replace("T", " ").replace("Z", "");
}

/**
 * 한 worker의 봇 목록을 보여주는 서브테이블
 */
function WorkerBotListView(props: {
  loading: boolean;
  error: string | null;
  bots: WorkerBotRow[];
}) {
  const { loading, error, bots } = props;

  if (loading) {
    return (
      <div className="text-xs text-base-content/60 flex items-center gap-2">
        <span className="loading loading-spinner loading-xs" />
        <span>봇 목록 불러오는 중…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-xs text-red-500">봇 목록 불러오기 실패: {error}</div>
    );
  }

  if (bots.length === 0) {
    return <div className="text-xs text-base-content/60">연결된 봇 없음</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="table table-compact w-full text-xs">
        <thead>
          <tr>
            <th className="text-[10px] font-normal text-base-content/60">
              botId
            </th>
            <th className="text-[10px] font-normal text-base-content/60">
              봇 이름
            </th>
            <th className="text-[10px] font-normal text-base-content/60">
              username
            </th>
          </tr>
        </thead>
        <tbody>
          {bots.map((b) => (
            <tr key={b.botId} className="hover:bg-base-200">
              <td className="align-top break-all text-[11px]">{b.botId}</td>
              <td className="align-top text-[11px]">{b.botName}</td>
              <td className="align-top text-[11px]">{b.username}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * 페이지네이션 footer
 */
function PaginationBar(props: {
  page: number;
  pageSize: number;
  total: number;
  setPage: (p: number) => void;
  refresh: () => void;
}) {
  const { page, pageSize, total, setPage, refresh } = props;

  const totalPages = useMemo(() => {
    if (pageSize <= 0) return 1;
    const calc = Math.ceil(total / pageSize);
    return calc > 0 ? calc : 1;
  }, [total, pageSize]);

  const prev = useCallback(() => {
    if (page > 1) {
      setPage(page - 1);
    }
  }, [page, setPage]);

  const next = useCallback(() => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  }, [page, totalPages, setPage]);

  return (
    <div className="flex items-center gap-2 text-xs">
      <button className="btn btn-xs" onClick={prev} disabled={page <= 1}>
        «
      </button>
      <span className="text-xs whitespace-nowrap">
        {page}/{totalPages}
      </span>
      <button
        className="btn btn-xs"
        onClick={next}
        disabled={page >= totalPages}
      >
        »
      </button>

      <button className="btn btn-xs btn-outline" onClick={refresh}>
        새로고침
      </button>
    </div>
  );
}

export default function ProcessTable(props: ProcessTableProps) {
  const {
    loading,
    error,

    rows,

    page,
    pageSize,
    total,
    setPage,

    refresh,

    idsSelected,
    toggleOne,

    stopLoadingMap,
    stopAllBotsForWorker,
  } = props;

  // 어떤 workerId가 확장되어 있는지
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // workerId -> { loading, error, bots }
  const [botLists, setBotLists] = useState<
    Record<
      string,
      {
        loading: boolean;
        error: string | null;
        bots: WorkerBotRow[];
      }
    >
  >({});

  const isSelected = useCallback(
    (workerId: string): boolean => {
      return idsSelected.includes(workerId);
    },
    [idsSelected]
  );

  const toggleExpand = useCallback(
    async (workerId: string) => {
      setExpanded((prev) => {
        const next: Record<string, boolean> = { ...prev };
        next[workerId] = !prev[workerId];
        return next;
      });

      // 이미 데이터가 있거나 로딩 중이면 재요청 안 함
      if (botLists[workerId]?.bots || botLists[workerId]?.loading) {
        return;
      }

      // 첫 로딩
      setBotLists((prev) => ({
        ...prev,
        [workerId]: {
          loading: true,
          error: null,
          bots: [],
        },
      }));

      try {
        const res = await fetch(`/api/admin/process/${workerId}/bots`, {
          method: "GET",
          cache: "no-store",
        });
        const json = (await res.json()) as unknown;
        const parsed = json as WorkerBotListResponse;

        if (!("ok" in parsed) || !parsed.ok) {
          const msg = (parsed as { error?: string }).error ?? "FETCH_FAILED";
          setBotLists((prev) => ({
            ...prev,
            [workerId]: {
              loading: false,
              error: msg,
              bots: [],
            },
          }));
        } else {
          setBotLists((prev) => ({
            ...prev,
            [workerId]: {
              loading: false,
              error: null,
              bots: parsed.data,
            },
          }));
        }
      } catch {
        setBotLists((prev) => ({
          ...prev,
          [workerId]: {
            loading: false,
            error: "NETWORK_ERROR",
            bots: [],
          },
        }));
      }
    },
    [botLists]
  );

  return (
    <section className="card bg-base-100 shadow-md">
      <div className="card-body p-4 gap-4">
        {/* 상단 헤더/페이지네이션 */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-xs">
          <div className="text-base-content/70">총 {total}개 프로세스</div>

          <PaginationBar
            page={page}
            pageSize={pageSize}
            total={total}
            setPage={setPage}
            refresh={refresh}
          />
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-sm">
            <span className="loading loading-spinner loading-sm" />
            <span>로딩 중…</span>
          </div>
        ) : null}

        {error ? (
          <div className="alert alert-error text-sm">
            <span>에러: {error}</span>
          </div>
        ) : null}

        {!loading && !error ? (
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full text-left">
              <thead>
                <tr>
                  <th className="text-[11px] font-normal text-base-content/60" />
                  <th className="text-[11px] font-normal text-base-content/60">
                    status
                  </th>
                  <th className="text-[11px] font-normal text-base-content/60">
                    processId
                  </th>
                  <th className="text-[11px] font-normal text-base-content/60">
                    taskArn
                  </th>
                  <th className="text-[11px] font-normal text-base-content/60">
                    revision
                  </th>
                  <th className="text-[11px] font-normal text-base-content/60 text-center">
                    botCount
                  </th>
                  <th className="text-[11px] font-normal text-base-content/60 whitespace-nowrap">
                    createdAt
                  </th>
                  <th className="text-[11px] font-normal text-base-content/60 whitespace-nowrap">
                    lastHeartbeat
                  </th>
                  <th className="text-[11px] font-normal text-base-content/60 whitespace-nowrap">
                    updatedAt
                  </th>
                  <th className="text-[11px] font-normal text-base-content/60">
                    actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="text-center text-sm text-base-content/60 py-6"
                    >
                      프로세스가 없습니다.
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => {
                    const workerId = row.id;
                    const checked = isSelected(workerId);
                    const exp = expanded[workerId] === true;
                    const botInfo = botLists[workerId] || {
                      loading: false,
                      error: null,
                      bots: [],
                    };
                    const stopBusy = stopLoadingMap[workerId] === true;

                    return (
                      <Fragment key={workerId}>
                        {/* main row */}
                        <tr
                          className="hover:bg-base-200 cursor-pointer"
                          onClick={() => {
                            void toggleExpand(workerId);
                          }}
                        >
                          {/* checkbox */}
                          <td
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleOne(workerId);
                            }}
                          >
                            <input
                              type="checkbox"
                              className="checkbox checkbox-sm"
                              checked={checked}
                              onChange={() => {
                                /* handled in onClick above */
                              }}
                            />
                          </td>

                          {/* status */}
                          <td className="align-top text-[11px]">
                            <StatusBadge
                              alive={row.alive}
                              isZombieSuspect={row.isZombieSuspect}
                            />
                          </td>

                          {/* processId */}
                          <td className="align-top text-[11px] break-all">
                            {row.id}
                          </td>

                          {/* taskArn */}
                          <td className="align-top text-[11px] break-all">
                            {row.taskArn ?? "-"}
                          </td>

                          {/* revision */}
                          <td className="align-top text-[11px]">
                            {row.revision ?? "-"}
                          </td>

                          {/* botCount */}
                          <td className="align-top text-[11px] text-center">
                            {row.botCount}
                          </td>

                          {/* createdAt */}
                          <td className="align-top text-[11px] whitespace-nowrap">
                            {formatIso(row.createdAt)}
                          </td>

                          {/* lastHeartbeat */}
                          <td className="align-top text-[11px] whitespace-nowrap">
                            {formatIso(row.lastHeartbeat)}
                          </td>

                          {/* updatedAt */}
                          <td className="align-top text-[11px] whitespace-nowrap">
                            {formatIso(row.updatedAt)}
                          </td>

                          {/* actions */}
                          <td
                            className="align-top text-[11px]"
                            onClick={(e) => {
                              e.stopPropagation(); // row toggle 막기
                            }}
                          >
                            <button
                              className={`btn btn-xs btn-outline ${
                                stopBusy ? "btn-disabled" : ""
                              }`}
                              disabled={stopBusy}
                              onClick={() => {
                                void stopAllBotsForWorker(workerId);
                              }}
                            >
                              {stopBusy ? (
                                <span className="loading loading-spinner loading-xs" />
                              ) : null}
                              <span>봇정지</span>
                            </button>
                          </td>
                        </tr>

                        {/* expanded row */}
                        {exp ? (
                          <tr className="bg-base-200/50 text-xs">
                            <td colSpan={10} className="p-3">
                              <div className="flex flex-col gap-2">
                                <div className="text-[11px] font-semibold">
                                  연결된 봇 목록
                                </div>
                                <WorkerBotListView
                                  loading={botInfo.loading}
                                  error={botInfo.error}
                                  bots={botInfo.bots}
                                />
                              </div>
                            </td>
                          </tr>
                        ) : null}
                      </Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </section>
  );
}
