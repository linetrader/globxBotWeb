// src/app/[locale]/(site)/(home)/hooks/useHomeBots.ts
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
// [수정] "@/app/(site)/bot-config/lib/fetcher" -> "@/app/[locale]/(site)/bot-config/lib/fetcher"
import {
  getJson,
  postJson,
} from "@/app/[locale]/(site)/bot-config/lib/fetcher";
// [수정] "@/app/(site)/bot-config/types" -> "@/app/[locale]/(site)/bot-config/types"
import type { BotRow, BotStatus } from "@/app/[locale]/(site)/bot-config/types";
import type { BotDetail, HomeViewState } from "../types/home";
import {
  // [수정] "@/app/(site)/bot-config/gaurd/bot-config" -> "@/app/[locale]/(site)/bot-config/gaurd/bot-config"
  parseBotsResponse,
  isBotRow,
  coerceStatus,
} from "@/app/[locale]/(site)/bot-config/gaurd/bot-config";

type BotsEnvelopeOk = { ok: true; data: unknown };
type BotsEnvelopeErr = { ok: false; error: string };
type BotsEnvelope = BotsEnvelopeOk | BotsEnvelopeErr;

export function useHomeBots(): HomeViewState {
  const [isAuthed, setIsAuthed] = useState<boolean>(false);
  const [authChecked, setAuthChecked] = useState<boolean>(false);

  const [bots, setBots] = useState<BotRow[]>([]);
  const [loadingBots, setLoadingBots] = useState<boolean>(false);
  const [botsError, setBotsError] = useState<string | undefined>(undefined);

  const [selectedBotId, setSelectedBotId] = useState<string | null>(null);

  const loadBots = useCallback(async () => {
    setLoadingBots(true);
    setBotsError(undefined);
    try {
      // 백엔드가 { ok:true, data:[...] } 또는 그냥 배열을 반환할 수 있으므로 unknown으로 받고 정규화
      const raw = await getJson<unknown>("/api/bot-config/bots");

      // 401 등에서 JSON이 { ok:false }일 수도 있으니 우선 ok 체크
      const maybeEnvelope = raw as BotsEnvelope;
      if ("ok" in maybeEnvelope) {
        if (maybeEnvelope.ok === false) {
          setBots([]);
          setBotsError(maybeEnvelope.error ?? "로드 실패");
          setIsAuthed(false);
          return;
        }
      }

      // 정규화: 상태값(coerceStatus) 포함 보수처리
      const rows = parseBotsResponse(raw).map((r) => ({
        ...r,
        status: coerceStatus(r),
      }));

      setBots(rows);
      setIsAuthed(true);
    } catch {
      // 401/네트워크 오류 등
      setBots([]);
      setBotsError("네트워크 오류 또는 인증 필요");
      setIsAuthed(false);
    } finally {
      setLoadingBots(false);
      setAuthChecked(true);
    }
  }, []);

  useEffect(() => {
    void loadBots();
  }, [loadBots]);

  const selectedBot: BotRow | undefined = useMemo(
    () => bots.find((b) => b.id === (selectedBotId ?? "")),
    [bots, selectedBotId]
  );

  const selectedStatus: BotStatus | undefined = selectedBot?.status;

  const reload = useCallback(async () => {
    await loadBots();
  }, [loadBots]);

  const startBot = useCallback(async (id: string) => {
    await postJson<{ id: string; action: "START" }, unknown>(
      "/api/bot-control",
      { id, action: "START" }
    );
  }, []);

  const stopBot = useCallback(async (id: string) => {
    await postJson<{ id: string; action: "STOP" }, unknown>(
      "/api/bot-control",
      { id, action: "STOP" }
    );
  }, []);

  // 단건 조회: /api/bot-config/bots/[id]
  const getBotById = useCallback(
    async (id: string): Promise<BotDetail | null> => {
      try {
        const raw = await getJson<unknown>(
          `/api/bot-config/bots/${encodeURIComponent(id)}`
        );

        // ApiResponse 형태일 수도 있음
        if (
          typeof (raw as { ok?: unknown })?.ok === "boolean" &&
          (raw as { ok: boolean }).ok === false
        ) {
          return null;
        }

        // { ok:true, data: {...} } | { ... } 모두 처리
        const data: unknown =
          typeof (raw as { ok?: unknown })?.ok === "boolean" &&
          (raw as { ok: boolean }).ok === true &&
          (raw as { data?: unknown }).data
            ? (raw as { data: unknown }).data
            : raw;

        if (!isBotRow(data)) return null;

        const r = data as BotRow;
        const normalized: BotDetail = {
          id: r.id,
          name: r.name,
          mode: r.mode,
          symbol: r.symbol,
          status: coerceStatus(r),
          enabled: r.enabled,
          // BotDetail에 추가 필드가 있다면 여기서 안전하게 매핑/기본값 부여
        };
        return normalized;
      } catch {
        return null;
      }
    },
    []
  );

  return {
    isAuthed,
    authChecked,

    bots,
    loadingBots,
    botsError,

    selected: {
      selectedBotId,
      selectedBot,
      selectedStatus,
    },
    setSelectedBotId,

    startBot,
    stopBot,

    reload,

    getBotById,
  };
}
