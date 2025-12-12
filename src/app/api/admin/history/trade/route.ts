// src/app/api/admin/history/trade/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserId } from "@/lib/request-user";

const DEFAULT_PAGE_SIZE = 20;

function toIntOrDefault(v: string | null, def: number): number {
  if (!v) {
    return def;
  }
  const n = parseInt(v, 10);
  if (!Number.isFinite(n) || n <= 0) {
    return def;
  }
  return n;
}

function isTradeStatus(v: string | null): v is "OPEN" | "CLOSED" | "ALL" {
  return v === "OPEN" || v === "CLOSED" || v === "ALL";
}

export async function GET(req: NextRequest) {
  // 인증 (admin만 접근)
  const adminId = await getUserId();
  if (!adminId) {
    return NextResponse.json(
      { ok: false, error: "UNAUTHORIZED" },
      { status: 401 }
    );
  }

  const { searchParams } = req.nextUrl;
  const pageParam = searchParams.get("page");
  const pageSizeParam = searchParams.get("pageSize");
  const statusParam = searchParams.get("status");

  const page = toIntOrDefault(pageParam, 1);
  const pageSize = toIntOrDefault(pageSizeParam, DEFAULT_PAGE_SIZE);
  const statusFilter: "OPEN" | "CLOSED" | "ALL" = isTradeStatus(statusParam)
    ? statusParam
    : "ALL";

  // where 절 구성
  const whereClause =
    statusFilter === "ALL"
      ? {}
      : {
          status: statusFilter,
        };

  // 전체 카운트
  const total = await prisma.trade.count({
    where: whereClause,
  });

  // 페이징
  const startIdx = (page - 1) * pageSize;

  const trades = await prisma.trade.findMany({
    where: whereClause,
    orderBy: {
      openedAt: "desc",
    },
    skip: startIdx,
    take: pageSize,
  });

  // Decimal -> string 변환 등 직렬화
  const rows = trades.map((t) => {
    return {
      id: t.id,
      botId: t.botId,
      symbol: t.symbol,
      side: t.side,
      leverage: t.leverage,
      marginMode: t.marginMode,
      status: t.status,

      entryQty: t.entryQty,
      entryCostUsdt: t.entryCostUsdt ? t.entryCostUsdt.toString() : null,
      entryPrice: t.entryPrice ? t.entryPrice.toString() : null,
      entryNotionalUsdt: t.entryNotionalUsdt
        ? t.entryNotionalUsdt.toString()
        : null,

      openedAt: t.openedAt.toISOString(),

      closeQty: t.closeQty ?? null,
      closePrice: t.closePrice ? t.closePrice.toString() : null,
      closeNotionalUsdt: t.closeNotionalUsdt
        ? t.closeNotionalUsdt.toString()
        : null,

      realizedPnlUsdt: t.realizedPnlUsdt ? t.realizedPnlUsdt.toString() : null,
      realizedRoiPct: t.realizedRoiPct ? t.realizedRoiPct.toString() : null,

      closedAt: t.closedAt ? t.closedAt.toISOString() : null,

      updatedAt: t.updatedAt.toISOString(),
    };
  });

  return NextResponse.json({
    ok: true,
    data: rows,
    page,
    pageSize,
    total,
  });
}
