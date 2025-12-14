// src/app/admin/history/trade/hooks/useTradeList.ts
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useToast } from "@/components/ui";
import { parseTradeListResponse, isTradeStatusFilter } from "../gaurd/trade";

import type {
  UseTradeListReturn,
  TradeRow,
  TradeListResponse,
  TradeStatusFilter,
} from "../types";

export function useTradeList(): UseTradeListReturn {
  const { toast } = useToast();

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [rows, setRows] = useState<TradeRow[]>([]);

  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(20);
  const [total, setTotal] = useState<number>(0);

  const [statusFilter, setStatusFilterState] =
    useState<TradeStatusFilter>("ALL");

  const setStatusFilter = useCallback((f: TradeStatusFilter) => {
    setStatusFilterState(f);
    setPage(1);
  }, []);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("pageSize", String(pageSize));
      if (isTradeStatusFilter(statusFilter) && statusFilter !== "ALL") {
        params.set("status", statusFilter);
      }

      const res = await fetch(`/api/admin/history/trade?${params.toString()}`, {
        method: "GET",
        cache: "no-store",
      });

      const json = (await res.json()) as unknown;
      const parsed: TradeListResponse = parseTradeListResponse(json);

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
  }, [page, pageSize, statusFilter, toast]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const refresh = useCallback(() => {
    fetchList();
  }, [fetchList]);

  const value: UseTradeListReturn = useMemo(
    () => ({
      loading,
      error,

      rows,

      page,
      pageSize,
      total,
      setPage,

      statusFilter,
      setStatusFilter,

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
      statusFilter,
      setStatusFilter,
      refresh,
    ]
  );

  return value;
}
