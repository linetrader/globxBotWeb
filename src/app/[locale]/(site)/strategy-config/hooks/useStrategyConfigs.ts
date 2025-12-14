// src/app/(site)/strategy-config/hooks/useStrategyConfigs.ts
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
// import {
//   StrategyListSchema,
//   StrategyItemSchema,
//   StrategyCreateBodySchema,
//   StrategyUpdateBodySchema,
//   StrategyDeleteBodySchema,
//   type StrategyItem,
//   type StrategyList,
//   type StrategyCreateBody,
//   type StrategyUpdateBody,
//   type StrategyDeleteBody,
//   type ErrorResponse,
// } from "@/types/strategy-config";
import { StrategyKind as PrismaStrategyKind } from "@/generated/prisma";
import {
  ErrorResponse,
  StrategyCreateBody,
  StrategyCreateBodySchema,
  StrategyDeleteBody,
  StrategyDeleteBodySchema,
  StrategyItem,
  StrategyItemSchema,
  StrategyList,
  StrategyListSchema,
  StrategyUpdateBody,
  StrategyUpdateBodySchema,
} from "../types";

type LoadParams = {
  exchangeMarketId?: string | null;
  kind?: PrismaStrategyKind;
};

export function useStrategyConfigs(params?: LoadParams) {
  const [items, setItems] = useState<StrategyList>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const qs = useMemo(() => {
    const sp = new URLSearchParams();
    if (params?.exchangeMarketId) {
      sp.set("exchangeMarketId", params.exchangeMarketId);
    }
    if (params?.kind) {
      sp.set("kind", params.kind);
    }
    return sp.toString();
  }, [params?.exchangeMarketId, params?.kind]);

  const list = useCallback(async (): Promise<void> => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/strategy-config${qs ? `?${qs}` : ""}`, {
        method: "GET",
        cache: "no-store",
      });
      if (!res.ok) {
        let msg = `Load failed (${res.status})`;
        try {
          const ej = (await res.json()) as ErrorResponse;
          if (typeof ej?.error === "string") msg = ej.error;
        } catch {
          // noop
        }
        setError(msg);
        return;
      }
      const raw = (await res.json()) as unknown;
      const parsed = StrategyListSchema.parse(raw);
      setItems(parsed);
    } catch (e) {
      const err = e as Error;
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [qs]);

  const createOne = useCallback(
    async (body: StrategyCreateBody): Promise<StrategyItem | null> => {
      setError("");
      const valid = StrategyCreateBodySchema.parse(body);
      const res = await fetch("/api/strategy-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(valid),
      });
      if (!res.ok) {
        let msg = `Create failed (${res.status})`;
        try {
          const ej = (await res.json()) as ErrorResponse;
          if (typeof ej?.error === "string") msg = ej.error;
        } catch {
          // noop
        }
        setError(msg);
        return null;
      }
      const raw = (await res.json()) as unknown;
      return StrategyItemSchema.parse(raw);
    },
    []
  );

  const updateOne = useCallback(
    async (body: StrategyUpdateBody): Promise<StrategyItem | null> => {
      setError("");
      const valid = StrategyUpdateBodySchema.parse(body);
      const res = await fetch("/api/strategy-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(valid),
      });
      if (!res.ok) {
        let msg = `Update failed (${res.status})`;
        try {
          const ej = (await res.json()) as ErrorResponse;
          if (typeof ej?.error === "string") msg = ej.error;
        } catch {
          // noop
        }
        setError(msg);
        return null;
      }
      const raw = (await res.json()) as unknown;
      return StrategyItemSchema.parse(raw);
    },
    []
  );

  const deleteOne = useCallback(
    async (body: StrategyDeleteBody): Promise<boolean> => {
      setError("");
      const valid = StrategyDeleteBodySchema.parse(body);
      const res = await fetch("/api/strategy-config", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(valid),
      });
      if (!res.ok) {
        let msg = `Delete failed (${res.status})`;
        try {
          const ej = (await res.json()) as ErrorResponse;
          if (typeof ej?.error === "string") msg = ej.error;
        } catch {
          // noop
        }
        setError(msg);
        return false;
      }
      return true;
    },
    []
  );

  useEffect(() => {
    void list();
  }, [list]);

  return {
    items,
    loading,
    error,
    list,
    createOne,
    updateOne,
    deleteOne,
    setError,
  };
}
