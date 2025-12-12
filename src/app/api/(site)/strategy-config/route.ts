// src/app/api/(site)/strategy-config/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/request-user";
import { Prisma, StrategyKind } from "@/generated/prisma";
import { ErrorResponse } from "@/app/(site)/my-config/types";
import {
  StrategyConfigWithRelations,
  StrategyCreateBody,
  StrategyCreateBodySchema,
  StrategyDeleteBody,
  StrategyDeleteBodySchema,
  StrategyItem,
  StrategyItemSchema,
  StrategyListSchema,
  StrategyUpdateBody,
  StrategyUpdateBodySchema,
} from "@/app/(site)/strategy-config/types";

export const runtime = "nodejs";

// ── 공통 유틸 ─────────────────────────────────────────────────────
function jsonError(
  status: number,
  payload: ErrorResponse
): NextResponse<ErrorResponse> {
  return NextResponse.json(payload, { status });
}

function formatKSTTimestamp(now: Date = new Date()): string {
  const kt = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
    .formatToParts(now)
    .reduce<Record<string, string>>((acc, p) => {
      if (p.type !== "literal") acc[p.type] = p.value;
      return acc;
    }, {});
  const y = kt.year ?? "0000";
  const m = (kt.month ?? "00").padStart(2, "0");
  const d = (kt.day ?? "00").padStart(2, "0");
  const H = (kt.hour ?? "00").padStart(2, "0");
  const M = (kt.minute ?? "00").padStart(2, "0");
  const S = (kt.second ?? "00").padStart(2, "0");
  return `${y}${m}${d}-${H}${M}${S}`;
}

function toStringOrEmpty(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function ensureNonEmptyName(input: unknown): string {
  const t = toStringOrEmpty(input).trim();
  return t.length > 0 ? t : `strategy-${formatKSTTimestamp()}`;
}

// Kind helpers
function hasTrend(kind: StrategyKind): boolean {
  return kind === StrategyKind.TREND || kind === StrategyKind.BOTH;
}

function hasBox(kind: StrategyKind): boolean {
  return kind === StrategyKind.BOX || kind === StrategyKind.BOTH;
}

function parseKindParam(v: string | null): StrategyKind | undefined {
  if (v === "TREND") return StrategyKind.TREND;
  if (v === "BOX") return StrategyKind.BOX;
  if (v === "BOTH") return StrategyKind.BOTH;
  return undefined;
}

// ── 빌더: Create/Update data 구성 ─────────────────────────────────
function buildCreateData(
  userId: string,
  body: StrategyCreateBody
): Prisma.StrategyConfigCreateInput {
  const safeName = ensureNonEmptyName(body.name);

  const data: Prisma.StrategyConfigCreateInput = {
    user: { connect: { id: userId } },
    name: safeName,
    kind: body.kind,

    // ✅ 공통
    useMartin: body.useMartin ?? false,
    martinMultiplier: body.martinMultiplier ?? 2.0,
    defaultSize: body.defaultSize ?? 0,
    maxSize: body.maxSize ?? 0,
    targetProfit: body.targetProfit ?? 0,
    targetLoss: body.targetLoss ?? 0,
    leverage: body.leverage ?? 1,
    timeframe: body.timeframe,
    enabled: true, // 생성 시에는 항상 true
    rsiLength: body.rsiLength ?? 14,

    // 🔽 리버스 진입 플래그
    reverseEntryEnabled: body.reverseEntryEnabled ?? false,

    // ✅ 시그널 확증/보조 파라미터 (StrategyConfig 공통 필드)
    adxConfirmThreshold: body.adxConfirmThreshold ?? 25,
    atrConfirmPeriod: body.atrConfirmPeriod ?? 14,
    minAtrPct: body.minAtrPct ?? 1,

    donchianLookback: body.donchianLookback ?? 20,
    supertrendPeriod: body.supertrendPeriod ?? 10,
    supertrendMult: body.supertrendMult ?? 3,

    rangeFollowTrendOnly: body.rangeFollowTrendOnly ?? true,
    rangeMinAtrMult: body.rangeMinAtrMult ?? 0,

    trendSlopeWindow: body.trendSlopeWindow ?? 30,
    trendSlopeThresholdAbs: body.trendSlopeThresholdAbs ?? 0.02,
    donchianNearBreakPct: body.donchianNearBreakPct ?? 0.15,

    // 하위(1:1)
    ...(hasTrend(body.kind)
      ? {
          trend: {
            create: {
              trendRsiUpperPullback: body.trend?.trendRsiUpperPullback ?? null,
              trendRsiLowerPullback: body.trend?.trendRsiLowerPullback ?? null,
            },
          },
        }
      : {}),
    ...(hasBox(body.kind)
      ? {
          box: {
            create: {
              lowerTh: body.box?.lowerTh ?? 30,
              upperTh: body.box?.upperTh ?? 70,
              boxTouchPct: body.box?.boxTouchPct ?? null,
            },
          },
        }
      : {}),
  };

  return data;
}

function buildUpdateData(
  body: StrategyUpdateBody
): Prisma.StrategyConfigUpdateInput {
  const data: Prisma.StrategyConfigUpdateInput = {
    ...(body.name !== undefined ? { name: body.name } : {}),
    ...(body.kind !== undefined ? { kind: body.kind } : {}),
    ...(body.rsiLength !== undefined ? { rsiLength: body.rsiLength } : {}),

    // ✅ 공통(부분 수정) — enabled 업데이트는 여기서 하지 않음
    ...(body.useMartin !== undefined ? { useMartin: body.useMartin } : {}),
    ...(body.martinMultiplier !== undefined
      ? { martinMultiplier: body.martinMultiplier }
      : {}),
    ...(body.defaultSize !== undefined
      ? { defaultSize: body.defaultSize }
      : {}),
    ...(body.maxSize !== undefined ? { maxSize: body.maxSize } : {}),
    ...(body.targetProfit !== undefined
      ? { targetProfit: body.targetProfit }
      : {}),
    ...(body.targetLoss !== undefined ? { targetLoss: body.targetLoss } : {}),
    ...(body.leverage !== undefined ? { leverage: body.leverage } : {}),
    ...(body.timeframe !== undefined ? { timeframe: body.timeframe } : {}),

    // 🔽 리버스 진입 플래그 (부분 수정)
    ...(body.reverseEntryEnabled !== undefined
      ? { reverseEntryEnabled: body.reverseEntryEnabled }
      : {}),

    // ✅ 시그널 확증/보조 파라미터 (부분 수정)
    ...(body.adxConfirmThreshold !== undefined
      ? { adxConfirmThreshold: body.adxConfirmThreshold }
      : {}),
    ...(body.atrConfirmPeriod !== undefined
      ? { atrConfirmPeriod: body.atrConfirmPeriod }
      : {}),
    ...(body.minAtrPct !== undefined ? { minAtrPct: body.minAtrPct } : {}),

    ...(body.donchianLookback !== undefined
      ? { donchianLookback: body.donchianLookback }
      : {}),
    ...(body.supertrendPeriod !== undefined
      ? { supertrendPeriod: body.supertrendPeriod }
      : {}),
    ...(body.supertrendMult !== undefined
      ? { supertrendMult: body.supertrendMult }
      : {}),

    ...(body.rangeFollowTrendOnly !== undefined
      ? { rangeFollowTrendOnly: body.rangeFollowTrendOnly }
      : {}),
    ...(body.rangeMinAtrMult !== undefined
      ? { rangeMinAtrMult: body.rangeMinAtrMult }
      : {}),

    ...(body.trendSlopeWindow !== undefined
      ? { trendSlopeWindow: body.trendSlopeWindow }
      : {}),
    ...(body.trendSlopeThresholdAbs !== undefined
      ? { trendSlopeThresholdAbs: body.trendSlopeThresholdAbs }
      : {}),
    ...(body.donchianNearBreakPct !== undefined
      ? { donchianNearBreakPct: body.donchianNearBreakPct }
      : {}),
  };

  return data;
}

// ── GET ────────────────────────────────────────────────────────────
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const userId = await getUserId();
    if (!userId) return jsonError(401, { error: "Unauthorized" });

    const { searchParams } = new URL(req.url);
    const kindParam = parseKindParam(searchParams.get("kind"));

    const where: Prisma.StrategyConfigWhereInput = {
      userId,
      ...(kindParam ? { kind: kindParam } : {}),
    };

    const rows = (await prisma.strategyConfig.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }],
      include: { trend: true, box: true },
    })) as StrategyConfigWithRelations[];

    const list: StrategyItem[] = rows.map(mapRowToItem);
    StrategyListSchema.parse(list);
    return NextResponse.json(list, { status: 200 });
  } catch (err: unknown) {
    if (err instanceof ZodError) {
      return jsonError(500, {
        error: "SCHEMA_VALIDATION_FAILED",
        details: err.issues,
      });
    }
    return jsonError(500, { error: "INTERNAL_ERROR" });
  }
}

// ── POST ───────────────────────────────────────────────────────────
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const userId = await getUserId();
    if (!userId) return jsonError(401, { error: "Unauthorized" });

    const raw = (await req.json()) as unknown;
    const obj: Record<string, unknown> =
      typeof raw === "object" && raw !== null
        ? (raw as Record<string, unknown>)
        : {};
    const normalized = { ...obj, name: ensureNonEmptyName(obj.name) };

    const body = StrategyCreateBodySchema.parse(normalized);

    const created = (await prisma.strategyConfig.create({
      data: buildCreateData(userId, body),
      include: { trend: true, box: true },
    })) as StrategyConfigWithRelations;

    const item = mapRowToItem(created);
    StrategyItemSchema.parse(item);
    return NextResponse.json(item, { status: 201 });
  } catch (err) {
    if (err instanceof ZodError) {
      return jsonError(400, { error: "VALIDATION_ERROR", details: err.issues });
    }
    return jsonError(500, { error: "INTERNAL_ERROR" });
  }
}

// ── PUT ────────────────────────────────────────────────────────────
export async function PUT(req: NextRequest): Promise<NextResponse> {
  try {
    const userId = await getUserId();
    if (!userId) return jsonError(401, { error: "Unauthorized" });

    const raw = (await req.json()) as unknown;
    const obj: Record<string, unknown> =
      typeof raw === "object" && raw !== null
        ? (raw as Record<string, unknown>)
        : {};

    const normalized = Object.prototype.hasOwnProperty.call(obj, "name")
      ? { ...obj, name: ensureNonEmptyName(obj.name) }
      : obj;

    const body = StrategyUpdateBodySchema.parse(normalized);

    const result = await prisma.$transaction(async (tx) => {
      const current = (await tx.strategyConfig.findUnique({
        where: { id: body.id },
        include: { trend: true, box: true },
      })) as StrategyConfigWithRelations | null;

      if (!current || current.userId !== userId) return null;

      const willChangeKind =
        typeof body.kind !== "undefined" && body.kind !== current.kind;

      const updated = (await tx.strategyConfig.update({
        where: { id: current.id },
        data: buildUpdateData(body),
        include: { trend: true, box: true },
      })) as StrategyConfigWithRelations;

      const effectiveKind = updated.kind;

      // KIND 변경 시 서브모델 정리/생성
      if (willChangeKind) {
        if (!hasTrend(effectiveKind) && updated.trend) {
          await tx.trendStrategy.delete({
            where: { strategyConfigId: updated.id },
          });
        }
        if (!hasBox(effectiveKind) && updated.box) {
          await tx.boxStrategy.delete({
            where: { strategyConfigId: updated.id },
          });
        }
        if (hasTrend(effectiveKind) && !updated.trend) {
          await tx.trendStrategy.create({
            data: {
              strategyConfigId: updated.id,
              trendRsiUpperPullback: body.trend?.trendRsiUpperPullback ?? null,
              trendRsiLowerPullback: body.trend?.trendRsiLowerPullback ?? null,
            },
          });
        }
        if (hasBox(effectiveKind) && !updated.box) {
          await tx.boxStrategy.create({
            data: {
              strategyConfigId: updated.id,
              lowerTh: body.box?.lowerTh ?? 30,
              upperTh: body.box?.upperTh ?? 70,
              boxTouchPct: body.box?.boxTouchPct ?? null,
            },
          });
        }
      } else {
        // KIND 동일 → 서브모델 값만 업데이트
        if (hasTrend(effectiveKind) && body.trend) {
          await tx.trendStrategy.update({
            where: { strategyConfigId: updated.id },
            data: {
              trendRsiUpperPullback:
                body.trend.trendRsiUpperPullback === undefined
                  ? undefined
                  : body.trend.trendRsiUpperPullback,
              trendRsiLowerPullback:
                body.trend.trendRsiLowerPullback === undefined
                  ? undefined
                  : body.trend.trendRsiLowerPullback,
            },
          });
        }
        if (hasBox(effectiveKind) && body.box) {
          await tx.boxStrategy.update({
            where: { strategyConfigId: updated.id },
            data: {
              lowerTh: body.box.lowerTh ?? undefined,
              upperTh: body.box.upperTh ?? undefined,
              boxTouchPct:
                body.box.boxTouchPct === undefined
                  ? undefined
                  : body.box.boxTouchPct,
            },
          });
        }
      }

      const finalRow = (await tx.strategyConfig.findUnique({
        where: { id: updated.id },
        include: { trend: true, box: true },
      })) as StrategyConfigWithRelations | null;

      return finalRow;
    });

    if (!result) return jsonError(404, { error: "Strategy not found" });

    const item = mapRowToItem(result);
    StrategyItemSchema.parse(item);
    return NextResponse.json(item, { status: 200 });
  } catch (err) {
    if (err instanceof ZodError) {
      return jsonError(400, { error: "VALIDATION_ERROR", details: err.issues });
    }
    if (
      err &&
      typeof err === "object" &&
      (err as { code?: string }).code === "P2025"
    ) {
      return jsonError(404, { error: "Strategy not found" });
    }
    return jsonError(500, { error: "INTERNAL_ERROR" });
  }
}

// ── DELETE ─────────────────────────────────────────────────────────
export async function DELETE(req: NextRequest): Promise<NextResponse> {
  try {
    const userId = await getUserId();
    if (!userId) return jsonError(401, { error: "Unauthorized" });

    const json = (await req.json()) as unknown;
    const body: StrategyDeleteBody = StrategyDeleteBodySchema.parse(json);

    const target = await prisma.strategyConfig.findUnique({
      where: { id: body.id },
      select: { id: true, userId: true },
    });
    if (!target || target.userId !== userId) {
      return jsonError(404, { error: "Strategy not found" });
    }

    await prisma.strategyConfig.delete({ where: { id: body.id } });

    return NextResponse.json({ ok: true, id: body.id }, { status: 200 });
  } catch (err) {
    if (err instanceof ZodError) {
      return jsonError(400, { error: "VALIDATION_ERROR", details: err.issues });
    }
    if (
      err &&
      typeof err === "object" &&
      (err as { code?: string }).code === "P2025"
    ) {
      return jsonError(404, { error: "Strategy not found" });
    }
    return jsonError(500, { error: "INTERNAL_ERROR" });
  }
}

// ── 매핑 ───────────────────────────────────────────────────────────
function mapRowToItem(r: StrategyConfigWithRelations): StrategyItem {
  const kind = r.kind as StrategyKind;

  const base = {
    id: r.id,
    userId: r.userId,
    name: r.name,
    kind,

    useMartin: r.useMartin,
    martinMultiplier: r.martinMultiplier,
    defaultSize: r.defaultSize,
    maxSize: r.maxSize,
    targetProfit: r.targetProfit,
    targetLoss: r.targetLoss,
    leverage: r.leverage,
    timeframe: r.timeframe,
    enabled: true, // 생성 시 true, 표시용 고정 (원하면 r.enabled 로 바꿔도 됨)
    rsiLength: r.rsiLength,

    // 🔽 리버스 진입 플래그
    reverseEntryEnabled: r.reverseEntryEnabled,

    // ✅ StrategyConfig 공통 시그널 파라미터
    adxConfirmThreshold: r.adxConfirmThreshold,
    atrConfirmPeriod: r.atrConfirmPeriod,
    minAtrPct: r.minAtrPct,

    donchianLookback: r.donchianLookback,
    supertrendPeriod: r.supertrendPeriod,
    supertrendMult: r.supertrendMult,

    rangeFollowTrendOnly: r.rangeFollowTrendOnly,
    rangeMinAtrMult: r.rangeMinAtrMult,

    trendSlopeWindow: r.trendSlopeWindow,
    trendSlopeThresholdAbs: r.trendSlopeThresholdAbs,
    donchianNearBreakPct: r.donchianNearBreakPct,

    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  } as const;

  return {
    ...base,
    lowerTh: hasBox(kind) ? (r.box?.lowerTh ?? 30) : null,
    upperTh: hasBox(kind) ? (r.box?.upperTh ?? 70) : null,
    boxTouchPct: hasBox(kind) ? (r.box?.boxTouchPct ?? null) : null,
    trendRsiUpperPullback: hasTrend(kind)
      ? (r.trend?.trendRsiUpperPullback ?? null)
      : null,
    trendRsiLowerPullback: hasTrend(kind)
      ? (r.trend?.trendRsiLowerPullback ?? null)
      : null,
  };
}
