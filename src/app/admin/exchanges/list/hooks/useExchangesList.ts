"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  type ExchangeListItem,
  type ExchangeListResponse,
  type ExchangeUpdateBody,
} from "../types";
import { ExchangeListResponseSchema } from "../types";
import { useToast } from "@/components/ui";

type UseExchangesListReturn = {
  items: ExchangeListItem[];
  keyword: string;
  setKeyword: (s: string) => void;
  loading: boolean;
  refreshing: boolean;
  errorMsg: string;
  filtered: ExchangeListItem[];
  refresh: () => Promise<void>;
  toggleActive: (id: string, next: boolean) => Promise<void>;
  toggleFutures: (id: string, next: boolean) => Promise<void>;
};

async function fetchJSON(url: string, init?: RequestInit): Promise<Response> {
  return fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
}

export function useExchangesList(): UseExchangesListReturn {
  const [items, setItems] = useState<ExchangeListItem[]>([]);
  const [keyword, setKeyword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const { toast } = useToast();

  const load = useCallback(async (): Promise<void> => {
    setErrorMsg("");
    setLoading(true);
    try {
      const res = await fetchJSON("/api/admin/exchanges/list", {
        method: "GET",
      });

      const ct = res.headers.get("content-type") ?? "";
      if (!ct.includes("application/json")) {
        throw new Error(
          `Unexpected content-type: ${ct} (status ${res.status})`
        );
      }

      const dataUnknown: unknown = await res.json();
      const data: ExchangeListResponse =
        ExchangeListResponseSchema.parse(dataUnknown);
      setItems(data.items);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Load failed";
      setErrorMsg(msg);
      toast({ title: "불러오기 실패", description: msg, variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const refresh = useCallback(async (): Promise<void> => {
    setRefreshing(true);
    try {
      await load();
      toast({ title: "새로고침 완료" });
    } catch {
      // load 가 이미 토스트 처리
    } finally {
      setRefreshing(false);
    }
  }, [load, toast]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (q.length === 0) return items;
    return items.filter(
      (it) =>
        it.code.toLowerCase().includes(q) || it.name.toLowerCase().includes(q)
    );
  }, [items, keyword]);

  const patch = useCallback(async (body: ExchangeUpdateBody): Promise<void> => {
    const res = await fetchJSON("/api/admin/exchanges/list", {
      method: "PATCH",
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      let msg = `Update failed (${res.status})`;
      try {
        const ej = (await res.json()) as { error?: string };
        if (ej?.error) msg = ej.error;
      } catch {
        // ignore
      }
      throw new Error(msg);
    }
  }, []);

  const toggleActive = useCallback(
    async (id: string, next: boolean): Promise<void> => {
      try {
        await patch({ id, active: next });
        setItems((prev) =>
          prev.map((it) => (it.id === id ? { ...it, active: next } : it))
        );
        toast({ title: "상태 변경", description: `active = ${next}` });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Update failed";
        toast({ title: "변경 실패", description: msg, variant: "error" });
      }
    },
    [patch, toast]
  );

  const toggleFutures = useCallback(
    async (id: string, next: boolean): Promise<void> => {
      try {
        await patch({ id, supportsFutures: next });
        setItems((prev) =>
          prev.map((it) =>
            it.id === id ? { ...it, supportsFutures: next } : it
          )
        );
        toast({
          title: "선물지원 변경",
          description: `supportsFutures = ${next}`,
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Update failed";
        toast({ title: "변경 실패", description: msg, variant: "error" });
      }
    },
    [patch, toast]
  );

  return {
    items,
    keyword,
    setKeyword,
    loading,
    refreshing,
    errorMsg,
    filtered,
    refresh,
    toggleActive,
    toggleFutures,
  };
}
