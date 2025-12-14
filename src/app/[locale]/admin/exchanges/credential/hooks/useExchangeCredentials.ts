// src/app/admin/exchanges/credential/hooks/useExchangeCredentials.ts
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useToast } from "@/components/ui";
import {
  type ExchangeCredentialItem,
  type ExchangeCredentialListResponse,
  type ExchangeCredentialUpdateBody,
} from "../types";
import { ExchangeCredentialListResponseSchema } from "../types";

type UseExchangeCredentialsReturn = {
  items: ExchangeCredentialItem[];
  keyword: string;
  setKeyword: (s: string) => void;
  exchangeFilter: string; // exchangeCode
  setExchangeFilter: (s: string) => void;
  loading: boolean;
  refreshing: boolean;
  errorMsg: string;
  filtered: ExchangeCredentialItem[];
  refresh: () => Promise<void>;
  updateRow: (body: ExchangeCredentialUpdateBody) => Promise<void>;
  exchangeOptions: { id: string; code: string; name: string }[];
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

export function useExchangeCredentials(): UseExchangeCredentialsReturn {
  const [items, setItems] = useState<ExchangeCredentialItem[]>([]);
  const [keyword, setKeyword] = useState<string>("");
  const [exchangeFilter, setExchangeFilter] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const { toast } = useToast();

  const load = useCallback(async (): Promise<void> => {
    setErrorMsg("");
    setLoading(true);
    try {
      const res = await fetchJSON("/api/admin/exchanges/credential", {
        method: "GET",
      });
      const ct = res.headers.get("content-type") ?? "";
      if (!ct.includes("application/json")) {
        throw new Error(
          `Unexpected content-type: ${ct} (status ${res.status})`
        );
      }
      const raw: unknown = await res.json();
      const data: ExchangeCredentialListResponse =
        ExchangeCredentialListResponseSchema.parse(raw);
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
      // load가 토스트 처리
    } finally {
      setRefreshing(false);
    }
  }, [load, toast]);

  useEffect(() => {
    void load();
  }, [load]);

  const exchangeOptions = useMemo(() => {
    const map = new Map<string, { id: string; code: string; name: string }>();
    items.forEach((it) => {
      if (!map.has(it.exchangeCode)) {
        map.set(it.exchangeCode, {
          id: it.exchangeId,
          code: it.exchangeCode,
          name: it.exchangeName,
        });
      }
    });
    return Array.from(map.values()).sort((a, b) =>
      a.code.localeCompare(b.code)
    );
  }, [items]);

  const filtered = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    return items.filter((it) => {
      const passExchange =
        exchangeFilter.length === 0 || it.exchangeCode === exchangeFilter;
      const passKeyword =
        q.length === 0 ||
        it.username.toLowerCase().includes(q) || // ✅ username 검색
        it.exchangeCode.toLowerCase().includes(q) ||
        it.exchangeName.toLowerCase().includes(q) ||
        (it.exchangeUid ?? "").toLowerCase().includes(q);
      return passExchange && passKeyword;
    });
  }, [items, keyword, exchangeFilter]);

  const patch = useCallback(
    async (body: ExchangeCredentialUpdateBody): Promise<void> => {
      const res = await fetchJSON("/api/admin/exchanges/credential", {
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
    },
    []
  );

  const updateRow = useCallback(
    async (body: ExchangeCredentialUpdateBody): Promise<void> => {
      const id = body.id;
      try {
        await patch(body);
        setItems((prev) =>
          prev.map((it) =>
            it.id === id
              ? {
                  ...it,
                  exchangeUid:
                    body.exchangeUid !== undefined
                      ? body.exchangeUid.length
                        ? body.exchangeUid
                        : null
                      : it.exchangeUid,
                }
              : it
          )
        );
        toast({ title: "저장 완료" });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Update failed";
        toast({ title: "저장 실패", description: msg, variant: "error" });
      }
    },
    [patch, toast]
  );

  return {
    items,
    keyword,
    setKeyword,
    exchangeFilter,
    setExchangeFilter,
    loading,
    refreshing,
    errorMsg,
    filtered,
    refresh,
    updateRow,
    exchangeOptions,
  };
}
