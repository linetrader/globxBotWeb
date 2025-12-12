// src/app/api/admin/bots/strategy/repo.ts
import { Prisma, PrismaClient } from "@/generated/prisma";
import type {
  StrategyGlobal,
  StrategyGlobalHistory,
  StrategyUpdateInput,
} from "./types";

// ✅ PrismaClient | TransactionClient 공통 타입
export type DbClient = PrismaClient | Prisma.TransactionClient;

function toDto(row: {
  id: string;
  bbw_thresh: Prisma.Decimal;
  bb_period: number;
  bb_k: Prisma.Decimal;
  trend_fast: number;
  trend_slow: number;
  is_active: boolean;
  version: number;
  updated_at: Date;
  created_at: Date;
}): StrategyGlobal {
  return {
    id: row.id,
    bbw_thresh: Number(row.bbw_thresh),
    bb_period: row.bb_period,
    bb_k: Number(row.bb_k),
    trend_fast: row.trend_fast,
    trend_slow: row.trend_slow,
    is_active: row.is_active,
    version: row.version,
    updated_at: row.updated_at,
    created_at: row.created_at,
  };
}

function toHistoryDto(row: {
  id: string;
  settings_id: string;
  bbw_thresh: Prisma.Decimal;
  bb_period: number;
  bb_k: Prisma.Decimal;
  trend_fast: number;
  trend_slow: number;
  version: number;
  changed_at: Date;
}): StrategyGlobalHistory {
  return {
    id: row.id,
    settings_id: row.settings_id,
    bbw_thresh: Number(row.bbw_thresh),
    bb_period: row.bb_period,
    bb_k: Number(row.bb_k),
    trend_fast: row.trend_fast,
    trend_slow: row.trend_slow,
    version: row.version,
    changed_at: row.changed_at,
  };
}

export async function repoGetActive(
  prisma: DbClient
): Promise<StrategyGlobal | null> {
  const row = await prisma.strategyGlobalSettings.findFirst({
    where: { is_active: true },
    orderBy: { updated_at: "desc" },
  });
  return row ? toDto(row) : null;
}

export async function repoGetHistory(
  prisma: DbClient,
  take: number
): Promise<StrategyGlobalHistory[]> {
  const rows = await prisma.strategyGlobalSettingsHistory.findMany({
    orderBy: { changed_at: "desc" },
    take,
  });
  return rows.map(toHistoryDto);
}

export async function repoInsertNewActive(
  prisma: DbClient,
  input: StrategyUpdateInput,
  nextVersion: number
): Promise<StrategyGlobal> {
  const created = await prisma.strategyGlobalSettings.create({
    data: {
      bbw_thresh: new Prisma.Decimal(input.bbw_thresh),
      bb_period: input.bb_period,
      bb_k: new Prisma.Decimal(input.bb_k),
      trend_fast: input.trend_fast,
      trend_slow: input.trend_slow,
      is_active: true,
      version: nextVersion,
    },
  });
  return toDto(created);
}

export async function repoDeactivateAllActive(
  prisma: DbClient
): Promise<number> {
  const res = await prisma.strategyGlobalSettings.updateMany({
    data: { is_active: false },
    where: { is_active: true },
  });
  return res.count;
}

export async function repoGetMaxVersion(prisma: DbClient): Promise<number> {
  const agg = await prisma.strategyGlobalSettings.aggregate({
    _max: { version: true },
  });
  const maxVersion = agg._max.version ?? 0;
  return maxVersion;
}
