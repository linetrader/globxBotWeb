// src/app/(site)/bot-config/hooks/useBots.ts
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getJson, postJson } from "../lib/fetcher";
import { BotRow, StrategyConfigMeta, ApiResponse } from "../types";
import {
  coerceStatus,
  isBotRow,
  isStrategyConfigMeta,
} from "../gaurd/bot-config";
import { useExchangeMarketOptions } from "./useExchangeMarketOptions";
import { useToast } from "@/components/ui";

type UseBotsArgs = {
  exchangesEndpoint?: string;
  strategiesEndpoint?: string;
  botsEndpoint?: string;

  /** 단일 컨트롤 엔드포인트 (START/STOP 공용) */
  controlEndpoint?: string; // default: "/api/bot-control"
};

type ApiEnvelope<T> = {
  ok: boolean;
  data?: T;
  error?: string;
  code?: string | number;
};

type DeleteResult = { ok: boolean; error?: string };

type StartStopBody =
  | { id: string; action: "START" }
  | { id: string; action: "STOP" };

export function useBots(args?: UseBotsArgs) {
  const { toast } = useToast();

  const exchangesEndpoint =
    args?.exchangesEndpoint ?? "/api/bot-config/exchange-markets";
  const strategiesEndpoint =
    args?.strategiesEndpoint ?? "/api/bot-config/strategy-configs";
  const botsEndpoint = args?.botsEndpoint ?? "/api/bot-config/bots";

  // ✅ 단일 컨트롤 엔드포인트
  const controlEndpoint = args?.controlEndpoint ?? "/api/bot-control";

  // 거래소/마켓 메타
  const {
    markets,
    exchangeNames,
    loading: loadingMarkets,
    error: marketsError,
    marketsByExchangeName,
  } = useExchangeMarketOptions(exchangesEndpoint);

  // 전략 메타
  const [strategies, setStrategies] = useState<StrategyConfigMeta[]>([]);
  const [loadingStrategies, setLoadingStrategies] = useState<boolean>(true);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const raw = await getJson<unknown>(strategiesEndpoint);
        const arr = Array.isArray(raw) ? raw.filter(isStrategyConfigMeta) : [];
        if (!cancel) {
          setStrategies(arr);
          setLoadingStrategies(false);
        }
      } catch {
        if (!cancel) {
          setStrategies([]);
          setLoadingStrategies(false);
        }
      }
    })();
    return () => {
      cancel = true;
    };
  }, [strategiesEndpoint]);

  // 봇 리스트
  const [bots, setBots] = useState<BotRow[]>([]);
  const [loadingBots, setLoadingBots] = useState<boolean>(true);
  const [botsError, setBotsError] = useState<string | undefined>(undefined);

  const loadBots = useCallback(async () => {
    setLoadingBots(true);
    setBotsError(undefined);
    try {
      const raw = await getJson<unknown>(botsEndpoint);
      let rows: BotRow[] = [];
      // ApiResponse<T> or T[]
      if (
        typeof (raw as { ok?: unknown })?.ok === "boolean" &&
        (raw as { ok: boolean }).ok === true &&
        Array.isArray((raw as { data?: unknown }).data)
      ) {
        rows = (raw as { data: unknown[] }).data.filter(isBotRow) as BotRow[];
      } else if (Array.isArray(raw)) {
        rows = raw.filter(isBotRow) as BotRow[];
      } else {
        rows = [];
      }
      const normalized = rows.map((r) => ({ ...r, status: coerceStatus(r) }));
      setBots(normalized);
      setLoadingBots(false);
    } catch {
      setBots([]);
      setBotsError("봇 목록을 불러오지 못했습니다.");
      setLoadingBots(false);
    }
  }, [botsEndpoint]);

  useEffect(() => {
    void loadBots();
  }, [loadBots]);

  // ✅ 단일 엔드포인트로 시작/정지
  const startBot = useCallback(
    async (id: string) => {
      try {
        const body: StartStopBody = { id, action: "START" };
        await postJson<StartStopBody, unknown>(controlEndpoint, body);
        toast({ title: "시작", description: "봇을 시작 요청했습니다." });
        await loadBots();
      } catch {
        toast({
          title: "시작 실패",
          description: "봇 시작 요청 중 오류가 발생했습니다.",
          variant: "error",
        });
      }
    },
    [controlEndpoint, loadBots, toast]
  );

  const stopBot = useCallback(
    async (id: string) => {
      try {
        const body: StartStopBody = { id, action: "STOP" };
        await postJson<StartStopBody, unknown>(controlEndpoint, body);
        toast({ title: "정지", description: "봇을 정지 요청했습니다." });
        await loadBots();
      } catch {
        toast({
          title: "정지 실패",
          description: "봇 정지 요청 중 오류가 발생했습니다.",
          variant: "error",
        });
      }
    },
    [controlEndpoint, loadBots, toast]
  );

  // 선택 및 삭제 상태
  const [selectedBotId, setSelectedBotId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // 삭제
  const deleteBot = useCallback(
    async (id: string): Promise<DeleteResult> => {
      setDeletingId(id);
      try {
        const res = await fetch(`${botsEndpoint}/${encodeURIComponent(id)}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        });
        const json = (await res.json()) as ApiEnvelope<null>;
        if (res.ok && json.ok) {
          return { ok: true };
        }
        return { ok: false, error: json.error ?? "삭제 실패" };
      } catch {
        return { ok: false, error: "네트워크 오류" };
      } finally {
        setDeletingId(null);
      }
    },
    [botsEndpoint]
  );

  // ★ 단건 조회: /api/bot-config/bots/[id]
  const getBotById = useCallback(
    async (id: string): Promise<BotRow | null> => {
      try {
        const res = await getJson<ApiResponse<BotRow>>(
          `${botsEndpoint}/${encodeURIComponent(id)}`
        );
        if ((res as { ok: boolean }).ok && (res as { data?: unknown }).data) {
          const data = (res as { data: unknown }).data as BotRow;
          return data;
        }
        return null;
      } catch {
        return null;
      }
    },
    [botsEndpoint]
  );

  const hasBots = useMemo(() => bots.length > 0, [bots]);

  return {
    // 메타
    strategies,
    loadingStrategies,
    markets,
    exchangeNames,
    loadingMarkets,
    marketsError,
    marketsByExchangeName,

    // 봇 목록
    bots,
    loadingBots,
    botsError,
    hasBots,
    loadBots,

    // 액션
    startBot,
    stopBot,

    // 선택/삭제
    selectedBotId,
    setSelectedBotId,
    deletingId,
    deleteBot,

    // ★ 단건 조회
    getBotById,
  };
}
