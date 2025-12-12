// src/app/admin/bots/list/hooks/useBotsList.ts
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { UseBotsListReturn, BotRow, RunningFilter } from "../types";
import { parseList, parseBackupStop, parseRestoreStart } from "../gaurd/bots";
import { useToast } from "@/components/ui";

/** 통합 제어 API 요청 payload */
type ControlPayload = {
  id: string;
  action: "START" | "STOP";
};
/** 통합 제어 API 응답 형태 */
type ControlResponseOk = { ok: true; workItem?: { id?: string } | null };
type ControlResponseErr = { ok: false; error: string; detail?: unknown };
type ControlResponse = ControlResponseOk | ControlResponseErr;

export function useBotsList(): UseBotsListReturn {
  const { toast } = useToast();

  // 기본 데이터 상태
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<BotRow[]>([]);

  // 선택 상태
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  // START/STOP 진행 상태
  const [starting, setStarting] = useState<boolean>(false);
  const [stopping, setStopping] = useState<boolean>(false);

  // 백업/복원 상태
  const [backingUpStopping, setBackingUpStopping] = useState<boolean>(false);
  const [restoring, setRestoring] = useState<boolean>(false);

  // 페이지네이션
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(20); // 고정값
  const [total, setTotal] = useState<number>(0);

  // 러닝상태 필터
  const [runningFilter, setRunningFilterState] = useState<RunningFilter>("ALL");

  // 검색 UI 인풋 (타이핑 중인 값)
  const [usernameInput, setUsernameInputState] = useState<string>("");

  // 실제 서버에 적용된 필터 값
  const [usernameFilter, setUsernameFilterState] = useState<string>("");

  /**
   * 서버 목록 조회
   * GET /api/admin/bots/list?page=&pageSize=&running=&username=
   */
  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("pageSize", String(pageSize));
      params.set("running", runningFilter);
      params.set("username", usernameFilter);

      const res = await fetch(`/api/admin/bots/list?${params.toString()}`, {
        cache: "no-store",
      });

      const json = await res.json();
      const parsed = parseList(json);

      if (!parsed.ok) {
        setError(parsed.error);
        toast({
          title: "목록 로드 실패",
          description: parsed.error,
          variant: "error",
        });
      } else {
        setRows(parsed.data);
        setTotal(parsed.total);
      }
    } catch {
      setError("NETWORK_ERROR");
      toast({
        title: "네트워크 오류",
        description: "잠시 후 다시 시도하세요.",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [toast, page, pageSize, runningFilter, usernameFilter]);

  // page / runningFilter / usernameFilter 변경 시만 호출
  useEffect(() => {
    fetchList();
  }, [fetchList]);

  // rows 변경 시 선택 초기화
  useEffect(() => {
    setSelected({});
  }, [rows]);

  const refresh = useCallback(() => {
    fetchList();
  }, [fetchList]);

  const toggleOne = useCallback((botId: string) => {
    setSelected((prev) => ({ ...prev, [botId]: !prev[botId] }));
  }, []);

  const toggleAll = useCallback(
    (checked: boolean) => {
      setSelected(() => {
        const next: Record<string, boolean> = {};
        for (const r of rows) next[r.id] = checked;
        return next;
      });
    },
    [rows]
  );

  const clearSelection = useCallback(() => {
    setSelected({});
  }, []);

  const idsSelected = useMemo<string[]>(
    () => Object.keys(selected).filter((k) => selected[k]),
    [selected]
  );

  /**
   * 공통 호출기: 통합 API /api/bot-control
   */
  const callBotControl = useCallback(
    async (payload: ControlPayload): Promise<ControlResponse> => {
      try {
        const res = await fetch("/api/bot-control", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload satisfies ControlPayload),
        });
        const json = (await res.json()) as ControlResponse;
        if (json && typeof (json as { ok?: unknown }).ok === "boolean") {
          return json as ControlResponse;
        }
        return { ok: false, error: "INVALID_RESPONSE" };
      } catch {
        return { ok: false, error: "NETWORK_ERROR" };
      }
    },
    []
  );

  /**
   * 일괄 START
   */
  const startSelected = useCallback(async () => {
    if (idsSelected.length === 0) {
      toast({ title: "선택 없음", description: "시작할 봇을 선택하세요." });
      return;
    }
    setStarting(true);
    try {
      const results = await Promise.allSettled(
        idsSelected.map((id) => callBotControl({ id, action: "START" }))
      );

      let okCount = 0;
      const fails: Array<{ id: string; reason: string }> = [];

      results.forEach((r, idx) => {
        const id = idsSelected[idx]!;
        if (r.status === "fulfilled") {
          const v = r.value;
          if (v.ok) okCount += 1;
          else fails.push({ id, reason: v.error });
        } else {
          fails.push({ id, reason: "REQUEST_REJECTED" });
        }
      });

      toast({
        title: "시작 요청 결과",
        description: `성공 ${okCount} / 실패 ${fails.length}`,
        variant: fails.length ? "success" : "warning",
      });

      if (fails.length) {
        console.warn("[startSelected] fails:", fails);
      }

      clearSelection();
      fetchList();
    } finally {
      setStarting(false);
    }
  }, [idsSelected, toast, callBotControl, clearSelection, fetchList]);

  /**
   * 일괄 STOP
   */
  const stopSelected = useCallback(async () => {
    if (idsSelected.length === 0) {
      toast({ title: "선택 없음", description: "종료할 봇을 선택하세요." });
      return;
    }
    setStopping(true);
    try {
      const results = await Promise.allSettled(
        idsSelected.map((id) => callBotControl({ id, action: "STOP" }))
      );

      let okCount = 0;
      const fails: Array<{ id: string; reason: string }> = [];

      results.forEach((r, idx) => {
        const id = idsSelected[idx]!;
        if (r.status === "fulfilled") {
          const v = r.value;
          if (v.ok) okCount += 1;
          else fails.push({ id, reason: v.error });
        } else {
          fails.push({ id, reason: "REQUEST_REJECTED" });
        }
      });

      toast({
        title: "종료 요청 결과",
        description: `성공 ${okCount} / 실패 ${fails.length}`,
        variant: fails.length ? "success" : "warning",
      });

      if (fails.length) {
        console.warn("[stopSelected] fails:", fails);
      }

      clearSelection();
      fetchList();
    } finally {
      setStopping(false);
    }
  }, [idsSelected, toast, callBotControl, clearSelection, fetchList]);

  // 러닝상태 필터 변경 시 page=1
  const setRunningFilter = useCallback((f: RunningFilter) => {
    setRunningFilterState(f);
    setPage(1);
  }, []);

  // username 인풋(onChange)
  const setUsernameInput = useCallback((v: string) => {
    setUsernameInputState(v);
  }, []);

  // "검색" 클릭 시 실제 필터값 반영 + page=1
  const applyUsernameFilter = useCallback(() => {
    setUsernameFilterState(() => usernameInput);
    setPage(1);
  }, [usernameInput]);

  /**
   * 현재 RUNNING 봇 백업 후 전체 종료
   * POST /api/admin/bots/backup-stop
   */
  const backupAndStopAll = useCallback(async () => {
    setBackingUpStopping(true);
    try {
      const res = await fetch("/api/admin/bots/backup-stop", {
        method: "POST",
      });
      const json = await res.json();
      const parsed = parseBackupStop(json);
      if (!parsed.ok) {
        toast({
          title: "백업/종료 실패",
          description: parsed.error,
          variant: "error",
        });
      } else {
        toast({
          title: "백업 완료 및 종료 요청",
          description: `백업ID=${parsed.backupId}, 대상=${parsed.count}, 종료 성공=${parsed.stopped.updated}`,
          variant: "success",
        });
      }
      fetchList();
    } catch {
      toast({
        title: "네트워크 오류",
        description: "잠시 후 다시 시도하세요.",
        variant: "error",
      });
    } finally {
      setBackingUpStopping(false);
    }
  }, [toast, fetchList]);

  /**
   * 백업된 봇 복원 시작(1초 텀)
   * POST /api/admin/bots/restore-start
   */
  const restoreBackupStart = useCallback(async () => {
    setRestoring(true);
    try {
      const res = await fetch("/api/admin/bots/restore-start", {
        method: "POST",
      });
      const json = await res.json();
      const parsed = parseRestoreStart(json);
      if (!parsed.ok) {
        toast({
          title: "복원 시작 실패",
          description: parsed.error,
          variant: "error",
        });
      } else {
        toast({
          title: "복원 시작",
          description: `백업ID=${parsed.backupId}, 대상=${parsed.total}, 시작 성공=${parsed.started.updated}`,
          variant: "success",
        });
      }
      fetchList();
    } catch {
      toast({
        title: "네트워크 오류",
        description: "잠시 후 다시 시도하세요.",
        variant: "error",
      });
    } finally {
      setRestoring(false);
    }
  }, [toast, fetchList]);

  const value: UseBotsListReturn = useMemo(
    () => ({
      loading,
      error,
      rows,
      selected,
      toggleOne,
      toggleAll,
      clearSelection,
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
    }),
    [
      loading,
      error,
      rows,
      selected,
      toggleOne,
      toggleAll,
      clearSelection,
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
    ]
  );

  return value;
}
