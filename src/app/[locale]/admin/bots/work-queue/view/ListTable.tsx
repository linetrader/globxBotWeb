// src/app/admin/bots/work-queue/view/ListTable.tsx
"use client";

import { WorkQueueRow } from "../types/list";

type ListTableProps = {
  loading: boolean;
  error: string | null;
  rows: WorkQueueRow[];
  page: number;
  pageSize: number;
  total: number;
  setPage: (next: number) => void;
  refresh: () => void;
};

function formatDate(s: string | null): string {
  if (!s) return "-";
  return s.replace("T", " ").replace("Z", "");
}

export function ListTable(props: ListTableProps) {
  const { loading, error, rows, page, pageSize, total, setPage, refresh } =
    props;

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="card bg-base-100 shadow border">
      <div className="card-body p-4 gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-sm font-semibold">
            작업 큐 목록{" "}
            <span className="text-xs font-normal text-base-content/60">
              ({total}건)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn btn-xs"
              onClick={refresh}
              disabled={loading}
            >
              새로고침
            </button>

            <div className="join">
              <button
                type="button"
                className="join-item btn btn-xs"
                disabled={page <= 1}
                onClick={() => {
                  if (page > 1) setPage(page - 1);
                }}
              >
                «
              </button>
              <button
                type="button"
                className="join-item btn btn-xs btn-ghost no-animation cursor-default"
              >
                {page}/{totalPages}
              </button>
              <button
                type="button"
                className="join-item btn btn-xs"
                disabled={page >= totalPages}
                onClick={() => {
                  if (page < totalPages) setPage(page + 1);
                }}
              >
                »
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-sm">
            <span className="loading loading-spinner loading-sm" />
            <span>불러오는 중…</span>
          </div>
        ) : null}

        {error ? (
          <div className="alert alert-error text-sm">
            <span>에러: {error}</span>
          </div>
        ) : null}

        {!loading && !error ? (
          <div className="overflow-x-auto">
            <table className="table table-xs">
              <thead>
                <tr>
                  <th>workId</th>
                  <th>user</th>
                  <th>bot</th>
                  <th>type / status</th>
                  <th>attempts</th>
                  <th>dedupeKey / group</th>
                  <th>createdAt</th>
                  <th>lastAttempt</th>
                  <th>exit / err</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td
                      className="text-center text-base-content/60"
                      colSpan={9}
                    >
                      데이터 없음
                    </td>
                  </tr>
                ) : (
                  rows.map((r) => (
                    <tr key={r.id} className="align-top">
                      <td className="font-mono text-[10px] break-all">
                        {r.id}
                      </td>

                      <td className="text-[11px]">
                        <div>{r.username ?? r.userId}</div>
                        <div className="text-[10px] text-base-content/60">
                          {r.userId}
                        </div>
                      </td>

                      <td className="text-[11px]">
                        <div>{r.botName ?? "-"}</div>
                        <div className="text-[10px] text-base-content/60 break-all">
                          {r.botId ?? "-"}
                        </div>
                      </td>

                      <td className="text-[11px]">
                        <div className="font-semibold">{r.type}</div>
                        <div className="text-[10px] text-base-content/60">
                          {r.status}
                        </div>
                      </td>

                      <td className="text-[11px]">{r.attempts}</td>

                      <td className="text-[10px] break-all">
                        <div>{r.dedupeKey ?? "-"}</div>
                        <div className="text-base-content/60">
                          {r.sqsGroupId ?? "-"}
                        </div>
                      </td>

                      <td className="text-[10px]">
                        <div>{formatDate(r.createdAt)}</div>
                        <div className="text-base-content/60">
                          {formatDate(r.updatedAt)}
                        </div>
                      </td>

                      <td className="text-[10px]">
                        <div>{formatDate(r.lastAttemptStartedAt)}</div>
                        <div className="text-base-content/60">
                          {formatDate(r.lastAttemptFinishedAt)}
                        </div>
                      </td>

                      <td className="text-[10px] break-all">
                        <div>
                          exit {r.lastAttemptExitCode ?? "-"} / qDelay{" "}
                          {r.queueDelaySec ?? "-"}s
                        </div>
                        <div className="text-base-content/60">
                          {r.lastAttemptError
                            ? r.lastAttemptError
                            : (r.lastAttemptWorkerTaskArn ?? "-")}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </div>
  );
}
