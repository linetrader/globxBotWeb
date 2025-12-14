// src/types/strategy-config/index.ts
import { z } from "zod";
import {
  StrategyKind as PrismaStrategyKind,
  Timeframe,
  Prisma,
} from "@/generated/prisma";

/** 공통 에러 응답 */
export type ErrorResponse = { error: string; details?: unknown };

/** BOX 전용 파라미터 */
export const BoxParamsSchema = z.object({
  lowerTh: z.number().optional(), // default 30 (서버 보정)
  upperTh: z.number().optional(), // default 70 (서버 보정)
  boxTouchPct: z.number().nullable().optional(),
});

/** TREND 전용 파라미터 */
export const TrendParamsSchema = z.object({
  trendRsiUpperPullback: z.number().nullable().optional(),
  trendRsiLowerPullback: z.number().nullable().optional(),
});

/** 응답 아이템 (서버→클라) — DB 스키마 반영 */
export const StrategyItemSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  name: z.string().min(1),
  kind: z.nativeEnum(PrismaStrategyKind),

  // ✅ 공통(StrategyConfig)
  useMartin: z.boolean(),
  martinMultiplier: z.number(),
  defaultSize: z.number().int(),
  maxSize: z.number().int(),
  targetProfit: z.number(),
  targetLoss: z.number(),
  leverage: z.number().int(),
  timeframe: z.nativeEnum(Timeframe),
  enabled: z.boolean(),
  rsiLength: z.number().int(),

  // 🔽 리버스 진입 플래그
  reverseEntryEnabled: z.boolean(),

  // ✅ 시그널 확증/보조 파라미터 (StrategyConfig 공통 필드)
  adxConfirmThreshold: z.number(),
  atrConfirmPeriod: z.number().int(),
  minAtrPct: z.number(),

  donchianLookback: z.number().int(),
  supertrendPeriod: z.number().int(),
  supertrendMult: z.number(),

  rangeFollowTrendOnly: z.boolean(),
  rangeMinAtrMult: z.number(),

  trendSlopeWindow: z.number().int(),
  trendSlopeThresholdAbs: z.number(),
  donchianNearBreakPct: z.number(),

  // ✅ BOX 전용(Kind에 따라 null)
  lowerTh: z.number().nullable(),
  upperTh: z.number().nullable(),
  boxTouchPct: z.number().nullable(),

  // ✅ TREND 전용(Kind에 따라 null)
  trendRsiUpperPullback: z.number().nullable(),
  trendRsiLowerPullback: z.number().nullable(),

  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
export type StrategyItem = z.infer<typeof StrategyItemSchema>;

export const StrategyListSchema = z.array(StrategyItemSchema);
export type StrategyList = z.infer<typeof StrategyListSchema>;

/** 생성 바디 — 서버가 없는 값은 기본값으로 보정 */
export const StrategyCreateBodySchema = z
  .object({
    name: z.string().min(1).optional(),
    kind: z.nativeEnum(PrismaStrategyKind),

    // ✅ 공통(전부 optional → 전달된 값만 반영)
    useMartin: z.boolean().optional(),
    martinMultiplier: z.number().optional(),
    defaultSize: z.number().int().optional(),
    maxSize: z.number().int().optional(),
    targetProfit: z.number().optional(),
    targetLoss: z.number().optional(),
    leverage: z.number().int().optional(),
    timeframe: z.nativeEnum(Timeframe).optional(),
    enabled: z.boolean().optional(),
    rsiLength: z.number().int().optional(),

    // 🔽 리버스 진입 플래그
    reverseEntryEnabled: z.boolean().optional(),

    // ✅ 시그널 확증/보조 파라미터 (부분 지정 가능)
    adxConfirmThreshold: z.number().optional(),
    atrConfirmPeriod: z.number().int().optional(),
    minAtrPct: z.number().optional(),

    donchianLookback: z.number().int().optional(),
    supertrendPeriod: z.number().int().optional(),
    supertrendMult: z.number().optional(),

    rangeFollowTrendOnly: z.boolean().optional(),
    rangeMinAtrMult: z.number().optional(),

    trendSlopeWindow: z.number().int().optional(),
    trendSlopeThresholdAbs: z.number().optional(),
    donchianNearBreakPct: z.number().optional(),

    // 전용
    trend: TrendParamsSchema.optional(),
    box: BoxParamsSchema.optional(),
  })
  .superRefine((val, ctx) => {
    if (val.kind === "TREND" && !val.trend) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "kind=TREND 는 trend 파라미터 필요",
        path: ["trend"],
      });
    } else if (val.kind === "BOX" && !val.box) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "kind=BOX 는 box 파라미터 필요",
        path: ["box"],
      });
    } else if (val.kind === "BOTH") {
      if (!val.trend) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "kind=BOTH 는 trend 파라미터 필요",
          path: ["trend"],
        });
      }
      if (!val.box) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "kind=BOTH 는 box 파라미터 필요",
          path: ["box"],
        });
      }
    }
  });
export type StrategyCreateBody = z.infer<typeof StrategyCreateBodySchema>;

/** 업데이트 바디 — 부분 수정 */
export const StrategyUpdateBodySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).optional(),
  kind: z.nativeEnum(PrismaStrategyKind).optional(),

  // ✅ 공통(부분 수정)
  useMartin: z.boolean().optional(),
  martinMultiplier: z.number().optional(),
  defaultSize: z.number().int().optional(),
  maxSize: z.number().int().optional(),
  targetProfit: z.number().optional(),
  targetLoss: z.number().optional(),
  leverage: z.number().int().optional(),
  timeframe: z.nativeEnum(Timeframe).optional(),
  enabled: z.boolean().optional(),
  rsiLength: z.number().int().optional(),

  // 🔽 리버스 진입 플래그 (부분 수정)
  reverseEntryEnabled: z.boolean().optional(),

  // ✅ 시그널 확증/보조 파라미터 (부분 수정)
  adxConfirmThreshold: z.number().optional(),
  atrConfirmPeriod: z.number().int().optional(),
  minAtrPct: z.number().optional(),

  donchianLookback: z.number().int().optional(),
  supertrendPeriod: z.number().int().optional(),
  supertrendMult: z.number().optional(),

  rangeFollowTrendOnly: z.boolean().optional(),
  rangeMinAtrMult: z.number().optional(),

  trendSlopeWindow: z.number().int().optional(),
  trendSlopeThresholdAbs: z.number().optional(),
  donchianNearBreakPct: z.number().optional(),

  // 전용(부분 수정)
  trend: TrendParamsSchema.optional(),
  box: BoxParamsSchema.optional(),
});
export type StrategyUpdateBody = z.infer<typeof StrategyUpdateBodySchema>;

/** 삭제 바디 */
export const StrategyDeleteBodySchema = z.object({ id: z.string().min(1) });
export type StrategyDeleteBody = z.infer<typeof StrategyDeleteBodySchema>;

/** 서버 include 타입 */
export type StrategyConfigWithRelations = Prisma.StrategyConfigGetPayload<{
  include: { trend: true; box: true };
}>;
