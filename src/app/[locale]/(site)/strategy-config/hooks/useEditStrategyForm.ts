// src/app/(site)/strategy-config/hooks/useEditStrategyForm.ts
"use client";

import { useMemo, useState } from "react";
import { StrategyKind } from "@/generated/prisma";
import { useToast } from "@/components/ui";
import type { EditForm } from "../types/common";
import { StrategyItem, StrategyUpdateBody } from "../types";

function parseFloatOrNull(s: string): number | null {
  return s.trim() === "" ? null : Number.parseFloat(s);
}
function parseFloatOrUndefined(s: string): number | undefined {
  return s.trim() === "" ? undefined : Number.parseFloat(s);
}

type Params = {
  item: StrategyItem;
  onUpdate: (body: StrategyUpdateBody) => Promise<void>;
  onClose: () => void;
  disabled?: boolean;
};

export function useEditStrategyForm(params: Params) {
  const { item, onUpdate, onClose, disabled = false } = params;
  const { toast } = useToast();

  const init: EditForm = useMemo(
    () => ({
      id: item.id,
      name: item.name,
      kind: item.kind,
      useMartin: item.useMartin,
      martinMultiplier: String(item.martinMultiplier),
      defaultSize: String(item.defaultSize),
      maxSize: String(item.maxSize),
      targetProfit: String(item.targetProfit),
      targetLoss: String(item.targetLoss),
      leverage: String(item.leverage),
      timeframe: item.timeframe,
      rsiLength: String(item.rsiLength),

      // 🔽 리버스 진입 플래그
      reverseEntryEnabled: item.reverseEntryEnabled,

      // ✅ StrategyConfig 공통 파라미터 → 문자열로 변환
      adxConfirmThreshold: String(item.adxConfirmThreshold),
      atrConfirmPeriod: String(item.atrConfirmPeriod),
      minAtrPct: String(item.minAtrPct),

      donchianLookback: String(item.donchianLookback),
      supertrendPeriod: String(item.supertrendPeriod),
      supertrendMult: String(item.supertrendMult),

      rangeFollowTrendOnly: item.rangeFollowTrendOnly,
      rangeMinAtrMult: String(item.rangeMinAtrMult),

      trendSlopeWindow: String(item.trendSlopeWindow),
      trendSlopeThresholdAbs: String(item.trendSlopeThresholdAbs),
      donchianNearBreakPct: String(item.donchianNearBreakPct),

      lowerTh: item.lowerTh === null ? "" : String(item.lowerTh),
      upperTh: item.upperTh === null ? "" : String(item.upperTh),
      boxTouchPct: item.boxTouchPct === null ? "" : String(item.boxTouchPct),
      trendRsiUpperPullback:
        item.trendRsiUpperPullback === null
          ? ""
          : String(item.trendRsiUpperPullback),
      trendRsiLowerPullback:
        item.trendRsiLowerPullback === null
          ? ""
          : String(item.trendRsiLowerPullback),
    }),
    [item]
  );

  const [form, setForm] = useState<EditForm>(init);
  const [updating, setUpdating] = useState<boolean>(false);

  async function onUpdateClick(): Promise<void> {
    setUpdating(true);
    try {
      const body: StrategyUpdateBody = {
        id: form.id,
        kind: form.kind,
      };

      const nameTrim = form.name.trim();
      if (nameTrim.length > 0) body.name = nameTrim;

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

      await onUpdate(body);
      toast({ title: "수정 완료", description: "전략이 수정되었습니다." });
    } catch {
      toast({
        title: "수정 실패",
        description: "입력을 확인해주세요.",
        variant: "error",
      });
    } finally {
      setUpdating(false);
    }
  }

  return { form, setForm, updating, disabled, onUpdateClick, onClose };
}
