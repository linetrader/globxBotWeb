import { StrategyKind, Timeframe } from "@/generated/prisma";

// [수정] label, description 제거 (언어팩에서 처리)
export const STRATEGY_PRESETS = {
  A: {
    kind: StrategyKind.BOTH,
    timeframe: Timeframe.T5m,
    rsiLength: "14",
    leverage: "20",
    targetProfit: "30",
    targetLoss: "15",
    minAtrPct: "0.3",
    trendRsiUpperPullback: "65",
    trendRsiLowerPullback: "35",
    upperTh: "70",
    lowerTh: "30",
    boxTouchPct: "1.0",
  },
  B: {
    kind: StrategyKind.BOTH,
    timeframe: Timeframe.T5m,
    rsiLength: "14",
    leverage: "20",
    targetProfit: "30",
    targetLoss: "15",
    minAtrPct: "0.5",
    trendRsiUpperPullback: "65",
    trendRsiLowerPullback: "35",
    upperTh: "70",
    lowerTh: "30",
    boxTouchPct: "1.0",
  },
  C: {
    kind: StrategyKind.BOTH,
    timeframe: Timeframe.T5m,
    rsiLength: "14",
    leverage: "20",
    targetProfit: "30",
    targetLoss: "15",
    minAtrPct: "0.7",
    trendRsiUpperPullback: "65",
    trendRsiLowerPullback: "35",
    upperTh: "70",
    lowerTh: "30",
    boxTouchPct: "1.0",
  },
} as const;

export type PresetType = keyof typeof STRATEGY_PRESETS;
