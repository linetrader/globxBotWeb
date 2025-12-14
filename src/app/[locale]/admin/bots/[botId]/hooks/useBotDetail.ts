// src/app/admin/bots/[botId]/hooks/useBotDetail.ts
"use client";

import { useEffect, useState, useCallback } from "react";
import type { BotDetail, BotDetailResponse } from "../types/detail";
import { useToast } from "@/components/ui";

export function useBotDetail(botId: string | null | undefined) {
  const { toast } = useToast();

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<BotDetail | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!botId) return; // param 아직 준비 안 된 경우
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/bots/${botId}`, {
        cache: "no-store",
      });

      const json: BotDetailResponse = await res.json();

      if (!json.ok) {
        const msg = json.error ?? "UNKNOWN_ERROR";
        setError(msg);
        setDetail(null);
        toast({
          title: "로드 실패",
          description: msg,
          variant: "error",
        });
      } else {
        setDetail(json.data);
      }
    } catch {
      setError("NETWORK_ERROR");
      setDetail(null);
      toast({
        title: "네트워크 오류",
        description: "상세 정보를 불러오지 못했습니다.",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [botId, toast]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  return {
    detail,
    loading,
    error,
    refetch: fetchDetail,
  };
}
