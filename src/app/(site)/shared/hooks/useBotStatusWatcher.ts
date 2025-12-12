// src/app/(site)/shared/hooks/useBotStatusWatcher.ts
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { BotRow, BotStatus } from "@/app/(site)/bot-config/types";

type PendingAction = "start" | "stop" | null;

type UseBotStatusWatcherArgs = {
  startBot: (id: string) => Promise<void> | void;
  stopBot: (id: string) => Promise<void> | void;
  loadBots: () => Promise<void>;
  getBotsSnapshot: () => BotRow[];
  getBotById?: (id: string) => Promise<BotRow | null>;
};

type WaitResult =
  | { ok: true }
  | { ok: false; reason: "timeout" | "cancelled" | "not_found" | "unknown" };

// 기본 타임아웃(워커/거래소 지연 고려하여 넉넉히)
const TIMEOUT_MS_START = 45_000;
const TIMEOUT_MS_STOP = 45_000;

// 적응형 폴링(초반 빠르게, 이후 느리게)
const FAST_PHASE_MS = 5_000;
const FAST_INTERVAL_MS = 300;
const SLOW_INTERVAL_MS = 1_000;

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

function nextInterval(startedAtMs: number): number {
  const elapsed = Date.now() - startedAtMs;
  return elapsed <= FAST_PHASE_MS ? FAST_INTERVAL_MS : SLOW_INTERVAL_MS;
}

// ✅ 서버가 내려줄 수 있는 RAW 상태를 그대로 반영(과도기 포함)
type Raw = "STOPPED" | "STARTING" | "RUNNING" | "STOPPING" | "ERROR";
function uiFromRow(b: BotRow): BotStatus | Raw {
  const raw = (b as { statusRaw?: Raw }).statusRaw;
  if (raw) return raw;
  return b.status ?? "UNKNOWN";
}

export function useBotStatusWatcher(args: UseBotStatusWatcherArgs) {
  const { startBot, stopBot, loadBots, getBotsSnapshot, getBotById } = args;

  const [pendingId, setPendingId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  const lockRef = useRef<boolean>(false);
  const cancelledRef = useRef<boolean>(false);
  const unmountedRef = useRef<boolean>(false);

  useEffect(() => {
    return () => {
      unmountedRef.current = true;
      // 언마운트는 취소로 간주하지 않음(unknown 반환)
    };
  }, []);

  const fetchOne = useCallback(
    async (id: string): Promise<BotRow | null> => {
      if (getBotById) {
        try {
          const one = await getBotById(id);
          if (one) return one;
        } catch {
          /* fallback below */
        }
      }
      try {
        await loadBots();
      } catch {
        /* ignore network error here */
      }
      const bots = getBotsSnapshot();
      return bots.find((b) => b.id === id) ?? null;
    },
    [getBotById, getBotsSnapshot, loadBots]
  );

  // 목표 상태 도달 판정: RUNNING 목표면 STARTING도 성공으로 간주 / STOPPED 목표면 STOPPING도 성공
  function reachedTarget(target: BotStatus, current: BotStatus | Raw): boolean {
    if (target === "RUNNING") {
      return current === "RUNNING" || current === "STARTING";
    }
    if (target === "STOPPED") {
      return current === "STOPPED" || current === "STOPPING";
    }
    return false;
  }

  const pollUntil = useCallback(
    async (
      id: string,
      target: BotStatus,
      timeoutMs: number
    ): Promise<WaitResult> => {
      const startedAt = Date.now();

      // 첫 조회
      let bot = await fetchOne(id);
      if (!bot) return { ok: false, reason: "not_found" };
      if (reachedTarget(target, uiFromRow(bot))) return { ok: true };

      while (true) {
        if (cancelledRef.current) return { ok: false, reason: "cancelled" };
        if (Date.now() - startedAt >= timeoutMs)
          return { ok: false, reason: "timeout" };

        await sleep(nextInterval(startedAt));
        if (unmountedRef.current) return { ok: false, reason: "unknown" };

        bot = await fetchOne(id);
        if (!bot) return { ok: false, reason: "not_found" };
        if (reachedTarget(target, uiFromRow(bot))) return { ok: true };
      }
    },
    [fetchOne]
  );

  const startAndWait = useCallback(
    async (id: string): Promise<WaitResult> => {
      if (lockRef.current) return { ok: false, reason: "unknown" };
      lockRef.current = true;
      cancelledRef.current = false;
      setPendingId(id);
      setPendingAction("start");

      try {
        await Promise.resolve(startBot(id));
      } catch {
        setPendingId(null);
        setPendingAction(null);
        lockRef.current = false;
        return { ok: false, reason: "unknown" };
      }

      const res = await pollUntil(id, "RUNNING", TIMEOUT_MS_START);

      try {
        await loadBots(); // 최종 동기화(화면 일관성)
      } catch {
        /* ignore */
      }

      setPendingId(null);
      setPendingAction(null);
      lockRef.current = false;
      return res;
    },
    [pollUntil, startBot, loadBots]
  );

  const stopAndWait = useCallback(
    async (id: string): Promise<WaitResult> => {
      if (lockRef.current) return { ok: false, reason: "unknown" };
      lockRef.current = true;
      cancelledRef.current = false;
      setPendingId(id);
      setPendingAction("stop");

      try {
        await Promise.resolve(stopBot(id));
      } catch {
        setPendingId(null);
        setPendingAction(null);
        lockRef.current = false;
        return { ok: false, reason: "unknown" };
      }

      const res = await pollUntil(id, "STOPPED", TIMEOUT_MS_STOP);

      try {
        await loadBots();
      } catch {
        /* ignore */
      }

      setPendingId(null);
      setPendingAction(null);
      lockRef.current = false;
      return res;
    },
    [pollUntil, stopBot, loadBots]
  );

  const cancel = useCallback(() => {
    cancelledRef.current = true;
  }, []);

  return { pendingId, pendingAction, startAndWait, stopAndWait, cancel };
}
