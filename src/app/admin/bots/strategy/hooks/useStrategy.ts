"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { UseStrategyReturn, SavePayload } from "../types";
import { parseGet, parseSave } from "../guard/strategy";
import { useToast } from "@/components/ui";

export function useStrategy(): UseStrategyReturn {
  const { toast } = useToast();

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [settings, setSettings] = useState<UseStrategyReturn["settings"]>(null);
  const [history, setHistory] = useState<UseStrategyReturn["history"]>([]);

  const [form, setForm] = useState<UseStrategyReturn["form"]>({
    bbw_thresh: "100.0",
    bb_period: "20",
    bb_k: "2.0",
    trend_fast: "12",
    trend_slow: "26",
  });

  const hydrateForm = useCallback((s: UseStrategyReturn["settings"]) => {
    if (!s) return;
    setForm({
      bbw_thresh: String(s.bbw_thresh),
      bb_period: String(s.bb_period),
      bb_k: String(s.bb_k),
      trend_fast: String(s.trend_fast),
      trend_slow: String(s.trend_slow),
    });
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/bots/strategy", {
        method: "GET",
        headers: { "x-admin": "true" },
        cache: "no-store",
      });
      const json = await res.json();
      const parsed = parseGet(json);
      if (!parsed.ok) {
        setError(parsed.error);
        toast({
          title: "로드 실패",
          description: parsed.error,
          variant: "error",
        });
      } else {
        setSettings(parsed.data.settings);
        setHistory(parsed.data.history);
        hydrateForm(parsed.data.settings);
      }
    } catch {
      setError("NETWORK_ERROR");
      toast({
        title: "네트워크 오류",
        description: "잠시 후 다시 시도하세요.",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [toast, hydrateForm]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const setField = useCallback((k: keyof SavePayload, v: string) => {
    setForm((prev) => ({ ...prev, [k]: v }));
  }, []);

  const save = useCallback(async () => {
    setSaving(true);
    try {
      const payload: SavePayload = {
        bbw_thresh: Number(form.bbw_thresh),
        bb_period: Number(form.bb_period),
        bb_k: Number(form.bb_k),
        trend_fast: Number(form.trend_fast),
        trend_slow: Number(form.trend_slow),
      };

      const res = await fetch("/api/admin/bots/strategy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin": "true",
        },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      const parsed = parseSave(json);
      if (!parsed.ok) {
        toast({
          title: "저장 실패",
          description: parsed.error,
          variant: "error",
        });
        return;
      }
      setSettings(parsed.data);
      toast({ title: "저장 완료", description: "설정이 갱신되었습니다." });
      await fetchData();
    } catch {
      toast({
        title: "네트워크 오류",
        description: "저장 중 문제가 발생했습니다.",
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  }, [form, toast, fetchData]);

  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  const value: UseStrategyReturn = useMemo(
    () => ({
      loading,
      saving,
      error,
      settings,
      history,
      form,
      setField,
      refresh,
      save,
    }),
    [loading, saving, error, settings, history, form, setField, refresh, save]
  );

  return value;
}
