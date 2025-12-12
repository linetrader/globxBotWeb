// src/app/api/admin/history/trade-event/route.ts
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

export async function GET(req: NextRequest) {
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
  const botFilterParam = searchParams.get("botId");
  const tradeFilterParam = searchParams.get("tradeId");

  const page = toIntOrDefault(pageParam, 1);
  const pageSize = toIntOrDefault(pageSizeParam, DEFAULT_PAGE_SIZE);

  // where 조건 (botId / tradeId 필터)
  const whereClause: Record<string, unknown> = {};
  if (botFilterParam && botFilterParam.length > 0) {
    whereClause.botId = botFilterParam;
  }
  if (tradeFilterParam && tradeFilterParam.length > 0) {
    whereClause.tradeId = tradeFilterParam;
  }

  // total count
  const total = await prisma.tradeEvent.count({
    where: whereClause,
  });

  // pagination indices
  const startIdx = (page - 1) * pageSize;

  const events = await prisma.tradeEvent.findMany({
    where: whereClause,
    orderBy: {
      timestamp: "desc",
    },
    skip: startIdx,
    take: pageSize,
  });

  const rows = events.map((ev) => {
    return {
      id: ev.id,
      tradeId: ev.tradeId,
      type: ev.type,
      timestamp: ev.timestamp.toISOString(),

      botId: ev.botId,
      exchangeMarketId: ev.exchangeMarketId,
      exchangeCredentialId: ev.exchangeCredentialId ?? null,

      symbol: ev.symbol,
      side: ev.side,
      leverage: ev.leverage,
      marginMode: ev.marginMode,

      qty: ev.qty,

      price: ev.price ? ev.price.toString() : null,
      notionalUsdt: ev.notionalUsdt ? ev.notionalUsdt.toString() : null,
      costUsdt: ev.costUsdt ? ev.costUsdt.toString() : null,

      realizedPnlUsdt: ev.realizedPnlUsdt
        ? ev.realizedPnlUsdt.toString()
        : null,
      realizedRoiPct: ev.realizedRoiPct ? ev.realizedRoiPct.toString() : null,

      createdAt: ev.createdAt.toISOString(),
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
