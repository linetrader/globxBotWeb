// src/app/api/admin/bots/strategy/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";
import type {
  StrategyGlobalDTO,
  StrategyGlobalHistoryDTO,
  ApiResponse, // ✅ 추가
} from "@/app/admin/bots/strategy/types";
import { getStrategyBundle, replaceActiveStrategy } from "./service";
import { isAdmin } from "@/lib/request-user";

const prisma = new PrismaClient();

function toDTO(row: {
  id: string;
  bbw_thresh: number;
  bb_period: number;
  bb_k: number;
  trend_fast: number;
  trend_slow: number;
  is_active: boolean;
  version: number;
  updated_at: Date;
  created_at: Date;
}): StrategyGlobalDTO {
  return {
    id: row.id,
    bbw_thresh: row.bbw_thresh,
    bb_period: row.bb_period,
    bb_k: row.bb_k,
    trend_fast: row.trend_fast,
    trend_slow: row.trend_slow,
    is_active: row.is_active,
    version: row.version,
    updated_at: row.updated_at.toISOString(),
    created_at: row.created_at.toISOString(),
  };
}

function toHistoryDTO(row: {
  id: string;
  settings_id: string;
  bbw_thresh: number;
  bb_period: number;
  bb_k: number;
  trend_fast: number;
  trend_slow: number;
  version: number;
  changed_at: Date;
}): StrategyGlobalHistoryDTO {
  return {
    id: row.id,
    settings_id: row.settings_id,
    bbw_thresh: row.bbw_thresh,
    bb_period: row.bb_period,
    bb_k: row.bb_k,
    trend_fast: row.trend_fast,
    trend_slow: row.trend_slow,
    version: row.version,
    changed_at: row.changed_at.toISOString(),
  };
}

export async function GET(): Promise<
  NextResponse<
    ApiResponse<{
      settings: StrategyGlobalDTO | null;
      history: StrategyGlobalHistoryDTO[];
    }>
  >
> {
  const isadmin = await isAdmin(); // ✅ await
  if (!isadmin) {
    return NextResponse.json(
      { ok: false, error: "UNAUTHORIZED" } as ApiResponse<never>,
      { status: 401 }
    );
  }

  const bundle = await getStrategyBundle(prisma, 100);
  return NextResponse.json({
    ok: true,
    data: {
      settings: bundle.settings ? toDTO(bundle.settings) : null,
      history: bundle.history.map(toHistoryDTO),
    },
  } as ApiResponse<{
    settings: StrategyGlobalDTO | null;
    history: StrategyGlobalHistoryDTO[];
  }>);
}

export async function POST(
  req: NextRequest
): Promise<NextResponse<ApiResponse<StrategyGlobalDTO>>> {
  const isadmin = await isAdmin(); // ✅ await
  if (!isadmin) {
    return NextResponse.json(
      { ok: false, error: "UNAUTHORIZED" } as ApiResponse<never>,
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const created = await replaceActiveStrategy(prisma, {
      bbw_thresh: Number(body?.bbw_thresh),
      bb_period: Number(body?.bb_period),
      bb_k: Number(body?.bb_k),
      trend_fast: Number(body?.trend_fast),
      trend_slow: Number(body?.trend_slow),
    });

    return NextResponse.json({
      ok: true,
      data: toDTO(created),
    } as ApiResponse<StrategyGlobalDTO>);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "UNKNOWN_ERROR";
    return NextResponse.json({ ok: false, error: msg } as ApiResponse<never>, {
      status: 400,
    });
  }
}
