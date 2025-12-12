// src/app/admin/history/trade-event/hooks/useTradeEventList.ts
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useToast } from "@/components/ui";
import { parseTradeEventListResponse } from "../gaurd/tradeEvent";

import type {
  UseTradeEventListReturn,
  TradeEventRow,
  TradeEventListResponse,
} from "../types";

export function useTradeEventList(): UseTradeEventListReturn {
  const { toast } = useToast();

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [rows, setRows] = useState<TradeEventRow[]>([]);

  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(20);
  const [total, setTotal] = useState<number>(0);

  const [botFilter, setBotFilterState] = useState<string>("");
  const [tradeFilter, setTradeFilterState] = useState<string>("");

  const setBotFilter = useCallback((id: string) => {
    setBotFilterState(id);
    setPage(1);
  }, []);

  const setTradeFilter = useCallback((id: string) => {
    setTradeFilterState(id);
    setPage(1);
  }, []);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("pageSize", String(pageSize));
      if (botFilter.trim().length > 0) {
        params.set("botId", botFilter.trim());
      }
      if (tradeFilter.trim().length > 0) {
        params.set("tradeId", tradeFilter.trim());
      }

      const res = await fetch(
        `/api/admin/history/trade-event?${params.toString()}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const json = (await res.json()) as unknown;
      const parsed: TradeEventListResponse = parseTradeEventListResponse(json);

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
  }, [page, pageSize, botFilter, tradeFilter, toast]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const refresh = useCallback(() => {
    fetchList();
  }, [fetchList]);

  const value: UseTradeEventListReturn = useMemo(
    () => ({
      loading,
      error,

      rows,

      page,
      pageSize,
      total,
      setPage,

      botFilter,
      setBotFilter,

      tradeFilter,
      setTradeFilter,

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
      botFilter,
      setBotFilter,
      tradeFilter,
      setTradeFilter,
      refresh,
    ]
  );

  return value;
}
