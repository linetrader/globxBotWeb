// src/app/(site)/strategy-config/hooks/useCreateStrategyForm.ts
"use client";

import { useState } from "react";
import { Timeframe, StrategyKind } from "@/generated/prisma";
import { useToast } from "@/components/ui";
import type { CreateForm } from "../types/common";
import { StrategyCreateBody } from "../types";

function parseFloatOrNull(s: string): number | null {
  return s.trim() === "" ? null : Number.parseFloat(s);
}
function parseFloatOrUndefined(s: string): number | undefined {
  return s.trim() === "" ? undefined : Number.parseFloat(s);
}

type Params = {
  onCreate: (body: StrategyCreateBody) => Promise<void>;
  error: string;
  setError: (msg: string) => void;
};

export function useCreateStrategyForm(params: Params) {
  const { onCreate, error, setError } = params;
  const { toast } = useToast();

  const [creating, setCreating] = useState<boolean>(false);

  const [form, setForm] = useState<CreateForm>({
    name: "",
    kind: StrategyKind.TREND,
    useMartin: false,
    martinMultiplier: "2.0",
    defaultSize: "20",
    maxSize: "500",
    targetProfit: "20",
    targetLoss: "5",
    leverage: "15",
    timeframe: Timeframe.T5m,
    rsiLength: "14",

    // 🔽 리버스 진입 플래그
    reverseEntryEnabled: false,

    // ✅ StrategyConfig 공통 파라미터 초기값
    adxConfirmThreshold: "25",
    atrConfirmPeriod: "14",
    minAtrPct: "0.3", // 🚀 [수정] 기본값 1 -> 0.3으로 변경

    donchianLookback: "20",
    supertrendPeriod: "10",
    supertrendMult: "3",

    rangeFollowTrendOnly: true,
    rangeMinAtrMult: "0",

    trendSlopeWindow: "30",
    trendSlopeThresholdAbs: "0.0007",
    donchianNearBreakPct: "1.5",

    // BOX
    lowerTh: "30",
    upperTh: "70",
    boxTouchPct: "1.0",

    // TREND
    trendRsiUpperPullback: "60",
    trendRsiLowerPullback: "40",
  });

  async function onCreateClick(): Promise<void> {
    setError("");
    setCreating(true);
    try {
      const body: StrategyCreateBody = {
        kind: form.kind,
      };

      const nameTrim = form.name.trim();
      if (nameTrim.length > 0) body.name = nameTrim;

      // 공통
      body.useMartin = form.useMartin;
      body.martinMultiplier = Number.parseFloat(form.martinMultiplier);
      body.defaultSize = Number.parseInt(form.defaultSize, 10);
      body.maxSize = Number.parseInt(form.maxSize, 10);
      body.targetProfit = Number.parseFloat(form.targetProfit);
      body.targetLoss = Number.parseFloat(form.targetLoss);
      body.leverage = Number.parseInt(form.leverage, 10);
      body.timeframe = form.timeframe;
      body.rsiLength = Number.parseInt(form.rsiLength, 10);

      // 🔽 리버스 진입 플래그
      body.reverseEntryEnabled = form.reverseEntryEnabled;

      // ✅ StrategyConfig 공통 파라미터 매핑
      body.adxConfirmThreshold = Number.parseFloat(form.adxConfirmThreshold);
      body.atrConfirmPeriod = Number.parseInt(form.atrConfirmPeriod, 10);
      body.minAtrPct = Number.parseFloat(form.minAtrPct);

      body.donchianLookback = Number.parseInt(form.donchianLookback, 10);
      body.supertrendPeriod = Number.parseInt(form.supertrendPeriod, 10);
      body.supertrendMult = Number.parseFloat(form.supertrendMult);

      body.rangeFollowTrendOnly = form.rangeFollowTrendOnly;
      body.rangeMinAtrMult = Number.parseFloat(form.rangeMinAtrMult);

      body.trendSlopeWindow = Number.parseInt(form.trendSlopeWindow, 10);
      body.trendSlopeThresholdAbs = Number.parseFloat(
        form.trendSlopeThresholdAbs
      );
      body.donchianNearBreakPct = Number.parseFloat(form.donchianNearBreakPct);

      const trendNeeded =
        form.kind === StrategyKind.TREND || form.kind === StrategyKind.BOTH;
      const boxNeeded =
        form.kind === StrategyKind.BOX || form.kind === StrategyKind.BOTH;

      if (trendNeeded) {
        body.trend = {
          trendRsiUpperPullback: parseFloatOrNull(form.trendRsiUpperPullback),
          trendRsiLowerPullback: parseFloatOrNull(form.trendRsiLowerPullback),
        };
      }
      if (boxNeeded) {
        body.box = {
          lowerTh: parseFloatOrUndefined(form.lowerTh),
          upperTh: parseFloatOrUndefined(form.upperTh),
          boxTouchPct: parseFloatOrNull(form.boxTouchPct),
        };
      }

      await onCreate(body);
      toast({ title: "생성 완료", description: "전략이 생성되었습니다." });
    } catch {
      toast({
        title: "생성 실패",
        description: "입력을 확인해주세요.",
        variant: "error",
      });
    } finally {
      setCreating(false);
    }
  }

  return { form, setForm, creating, error, onCreateClick };
}
