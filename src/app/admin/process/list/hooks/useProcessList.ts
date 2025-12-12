// src/app/admin/process/list/hooks/useProcessList.ts
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useToast } from "@/components/ui";
import {
  parseProcessListResponse,
  parseBulkDeleteResponse,
  parseStopAllResponse,
} from "../gaurd/process";

import type {
  AliveFilter,
  ProcessRow,
  UseProcessListReturn,
  ProcessListResponse,
  BulkDeleteResponse,
  StopAllResponse,
} from "../types";

export function useProcessList(): UseProcessListReturn {
  const { toast } = useToast();

  const [loading, setLoading] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);

  const [error, setError] = useState<string | null>(null);

  const [rows, setRows] = useState<ProcessRow[]>([]);

  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(20);
  const [total, setTotal] = useState<number>(0);

  const [aliveFilter, setAliveFilterState] = useState<AliveFilter>("ALL");

  // workerId별 stop-all in-flight 여부
  const [stopLoadingMap, setStopLoadingMap] = useState<Record<string, boolean>>(
    {}
  );

  // 선택된 process rows
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  // 현재 선택된 프로세스 ID들
  const idsSelected = useMemo(() => {
    return Object.keys(selected).filter((id) => selected[id]);
  }, [selected]);

  // 현재 페이지 rows 중 STALE(alive === false) 대상으로 가능한 삭제 수(표시용)
  const staleDeletableIdsThisPage = useMemo(() => {
    return rows.filter((r) => r.alive === false).map((r) => r.id);
  }, [rows]);

  const staleDeletableCount = useMemo(() => {
    return staleDeletableIdsThisPage.length;
  }, [staleDeletableIdsThisPage]);

  const setAliveFilter = useCallback((f: AliveFilter) => {
    setAliveFilterState(f);
    setPage(1);
    setSelected({});
  }, []);

  const toggleOne = useCallback((id: string) => {
    setSelected((prev) => {
      const next: Record<string, boolean> = { ...prev };
      next[id] = !next[id];
      return next;
    });
  }, []);

  const toggleAll = useCallback((currentRows: ProcessRow[]) => {
    setSelected((prev) => {
      const allSelected = currentRows.every((r) => prev[r.id]);
      const next: Record<string, boolean> = { ...prev };

      if (allSelected) {
        for (const r of currentRows) {
          next[r.id] = false;
        }
      } else {
        for (const r of currentRows) {
          next[r.id] = true;
        }
      }

      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelected({});
  }, []);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("pageSize", String(pageSize));
      if (aliveFilter !== "ALL") {
        params.set("alive", aliveFilter);
      }

      const res = await fetch(`/api/admin/process/list?${params.toString()}`, {
        method: "GET",
        cache: "no-store",
      });

      const json = (await res.json()) as unknown;
      const parsed: ProcessListResponse = parseProcessListResponse(json);

      if (!parsed.ok) {
        const msg = parsed.error ?? "UNKNOWN_ERROR";
        setError(msg);
        toast({
          variant: "error",
          description: msg,
        });
      } else {
        setRows(parsed.data);
        setTotal(parsed.total);
        // 선택 상태는 유지
      }
    } catch {
      const msg = "FETCH_FAILED";
      setError(msg);
      toast({
        variant: "error",
        description: msg,
      });
    } finally {
      setLoading(false);
    }
  }, [aliveFilter, page, pageSize, toast]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const refresh = useCallback(() => {
    fetchList();
  }, [fetchList]);

  // 선택삭제 가능 여부: 선택된 것들이 모두 STALE인지 확인
  const canDeleteSelected = useMemo(() => {
    if (idsSelected.length === 0) {
      return false;
    }
    const selectedSet = new Set(idsSelected);
    return rows
      .filter((r) => selectedSet.has(r.id))
      .every((r) => r.alive === false);
  }, [idsSelected, rows]);

  // [선택삭제] - 기존과 동일
  const deleteSelected = useCallback(async () => {
    if (!canDeleteSelected || idsSelected.length === 0) {
      toast({
        variant: "error",
        description: "삭제할 수 없는 항목입니다.",
      });
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/process/list`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          processIds: idsSelected,
        }),
      });

      const json = (await res.json()) as unknown;
      const parsed: BulkDeleteResponse = parseBulkDeleteResponse(json);

      if (!parsed.ok) {
        const msg = parsed.error ?? "UNKNOWN_ERROR";
        toast({
          variant: "error",
          description: msg,
        });
      } else {
        clearSelection();
        fetchList();
      }
    } catch {
      toast({
        variant: "error",
        description: "DELETE_FAILED",
      });
    } finally {
      setDeleting(false);
    }
  }, [canDeleteSelected, idsSelected, toast, clearSelection, fetchList]);

  /**
   * [전체 STALE 삭제]
   * - 페이지/선택 무관
   * - 서버에서 접근 가능한 모든 STALE 워커를 조회 후 삭제
   * - payload: { deleteAllStale: true }
   */
  const deleteAllStale = useCallback(async () => {
    setDeleting(true);

    try {
      const res = await fetch(`/api/admin/process/list`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          deleteAllStale: true,
        }),
      });

      const json = (await res.json()) as unknown;
      const parsed: BulkDeleteResponse = parseBulkDeleteResponse(json);

      if (!parsed.ok) {
        const msg = parsed.error ?? "UNKNOWN_ERROR";
        toast({
          variant: "error",
          description: msg,
        });
      } else {
        clearSelection();
        fetchList();
      }
    } catch {
      toast({
        variant: "error",
        description: "DELETE_ALL_STALE_FAILED",
      });
    } finally {
      setDeleting(false);
    }
  }, [toast, clearSelection, fetchList]);

  /**
   * 특정 workerId가 가진 봇 전부 STOP 요청
   */
  const stopAllBotsForWorker = useCallback(
    async (workerId: string) => {
      // 중복 클릭 방지
      setStopLoadingMap((prev) => {
        const next: Record<string, boolean> = { ...prev };
        next[workerId] = true;
        return next;
      });

      try {
        const res = await fetch(`/api/admin/process/${workerId}/stop-all`, {
          method: "POST",
        });

        const json = (await res.json()) as unknown;
        const parsed: StopAllResponse = parseStopAllResponse(json);

        if (!parsed.ok) {
          const msg = parsed.error ?? "UNKNOWN_ERROR";
          toast({
            variant: "error",
            description: msg,
          });
        } else {
          const stoppedCount = parsed.data.stoppedOkIds.length;
          toast({
            description: `정지 요청 완료 (${stoppedCount} bots)`,
          });
          // 상태 갱신
          fetchList();
        }
      } catch {
        toast({
          variant: "error",
          description: "STOP_ALL_FAILED",
        });
      } finally {
        setStopLoadingMap((prev) => {
          const next: Record<string, boolean> = { ...prev };
          next[workerId] = false;
          return next;
        });
      }
    },
    [toast, fetchList]
  );

  const value: UseProcessListReturn = useMemo(
    () => ({
      loading,
      error,

      rows,

      page,
      pageSize,
      total,
      setPage,

      aliveFilter,
      setAliveFilter,

      idsSelected,
      toggleOne,
      toggleAll,
      clearSelection,

      deleting,
      deleteSelected,

      staleDeletableCount,
      deleteAllStale,

      stopLoadingMap,
      stopAllBotsForWorker,

      refresh,
    }),
    [
      loading,
      error,
      rows,
      page,
      pageSize,
      total,
      setPage,
      aliveFilter,
      setAliveFilter,
      idsSelected,
      toggleOne,
      toggleAll,
      clearSelection,
      deleting,
      deleteSelected,
      staleDeletableCount,
      deleteAllStale,
      stopLoadingMap,
      stopAllBotsForWorker,
      refresh,
    ]
  );

  return value;
}
