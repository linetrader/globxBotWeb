// src/app/(site)/history/hooks/useHistoryList.ts
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useToast } from "@/components/ui";
import { parseHistoryListResponse } from "../gaurd/history";

import type {
  UseHistoryListReturn,
  HistoryRow,
  HistoryListResponse,
  BotOption,
} from "../types";

export function useHistoryList(): UseHistoryListReturn {
  const { toast } = useToast();

  // 로딩/에러/데이터
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [rows, setRows] = useState<HistoryRow[]>([]);

  // 페이지네이션
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);

  // 필터 (select 기반)
  const [botIdFilter, setBotIdFilterState] = useState<string>("");
  const [symbolFilter, setSymbolFilterState] = useState<string>("");

  // 셀렉트 옵션
  const [botOptions, setBotOptions] = useState<BotOption[]>([]);
  const [symbolOptions, setSymbolOptions] = useState<string[]>([]);

  const setBotIdFilter = useCallback((v: string) => {
    setBotIdFilterState(v);
    setPage(1);
  }, []);

  const setSymbolFilter = useCallback((v: string) => {
    setSymbolFilterState(v);
    setPage(1);
  }, []);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      if (botIdFilter.trim().length > 0) {
        params.set("botId", botIdFilter.trim());
      }
      if (symbolFilter.trim().length > 0) {
        params.set("symbol", symbolFilter.trim());
      }

      const res = await fetch(`/api/history?${params.toString()}`, {
        method: "GET",
        cache: "no-store",
      });

      const json = (await res.json()) as unknown;
      const parsed: HistoryListResponse = parseHistoryListResponse(json);

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

        // 옵션 업데이트
        setBotOptions(parsed.bots);
        setSymbolOptions(parsed.symbols);
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
  }, [page, botIdFilter, symbolFilter, toast]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const refresh = useCallback(() => {
    fetchList();
  }, [fetchList]);

  const value: UseHistoryListReturn = useMemo(
    () => ({
      loading,
      error,

      rows,

      page,
      pageSize,
      total,
      setPage,

      botIdFilter,
      setBotIdFilter,

      symbolFilter,
      setSymbolFilter,

      botOptions,
      symbolOptions,

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
      botIdFilter,
      setBotIdFilter,
      symbolFilter,
      setSymbolFilter,
      botOptions,
      symbolOptions,
      refresh,
    ]
  );

  return value;
}
