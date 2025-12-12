// src/app/api/(site)/history/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserId } from "@/lib/request-user";
import { Prisma } from "@/generated/prisma";

const PAGE_SIZE = 20;

function toIntOrDefault(v: string | null, def: number): number {
  if (!v) return def;
  const n = parseInt(v, 10);
  if (!Number.isFinite(n) || n <= 0) return def;
  return n;
}

function normalizeFilter(v: string | null): string | undefined {
  if (!v) return undefined;
  const t = v.trim();
  if (t.length === 0) return undefined;
  return t;
}

export async function GET(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json(
      { ok: false, error: "UNAUTHORIZED" },
      { status: 401 }
    );
  }

  const { searchParams } = req.nextUrl;
  const pageParam = searchParams.get("page");
  const botIdParam = searchParams.get("botId");
  const symbolParam = searchParams.get("symbol");

  const page = toIntOrDefault(pageParam, 1);
  const botIdFilter = normalizeFilter(botIdParam);
  const symbolFilter = normalizeFilter(symbolParam);

  // 내가 가진 봇들
  const myBots = await prisma.tradingBot.findMany({
    where: { userId },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  if (myBots.length === 0) {
    return NextResponse.json({
      ok: true,
      data: [],
      page,
      pageSize: PAGE_SIZE,
      total: 0,
      bots: [],
      symbols: [],
    });
  }

  const myBotIdsAll = myBots.map((b) => b.id);

  // symbol 옵션 목록
  const symbolRows = await prisma.trade.findMany({
    where: { botId: { in: myBotIdsAll } },
    distinct: ["symbol"],
    select: { symbol: true },
    orderBy: { symbol: "asc" },
  });

  const allSymbolsForUser: string[] = symbolRows
    .map((r) => r.symbol)
    .filter((s) => !!s && s.trim().length > 0);

  // 필터링할 botId들
  const effectiveBotIds: string[] = botIdFilter
    ? myBotIdsAll.includes(botIdFilter)
      ? [botIdFilter]
      : [] // 내 소유가 아니면 빈 결과
    : myBotIdsAll;

  const whereTrade: Prisma.TradeWhereInput = {
    botId: { in: effectiveBotIds },
    ...(symbolFilter
      ? {
          symbol: {
            equals: symbolFilter,
            mode: Prisma.QueryMode.insensitive,
          },
        }
      : {}),
  };

  const total =
    effectiveBotIds.length === 0
      ? 0
      : await prisma.trade.count({ where: whereTrade });

  const startIdx = (page - 1) * PAGE_SIZE;

  const trades =
    effectiveBotIds.length === 0
      ? []
      : await prisma.trade.findMany({
          where: whereTrade,
          // 청산 시간 기준 최신순, 동률 시 진입 시간 최신순
          orderBy: [{ openedAt: "desc" }, { id: "desc" }],
          skip: startIdx,
          take: PAGE_SIZE,
        });

  // botId -> botName 매핑
  const botNameMap: Record<string, string> = {};
  for (const b of myBots) botNameMap[b.id] = b.name;

  // rows 직렬화 (realizedRoiPct 포함, exchange 칼럼 사용)
  const rows = trades.map((t) => {
    return {
      botId: t.botId,
      botName: botNameMap[t.botId] ?? "",
      // 사람이 읽는 거래소명 (예: "gateio", "websea")
      exchange: t.exchange ?? "-",
      symbol: t.symbol,
      side: t.side,
      leverage: t.leverage,
      status: t.status,
      entryPrice: t.entryPrice ? t.entryPrice.toString() : null,
      entryCostUsdt: t.entryCostUsdt ? t.entryCostUsdt.toString() : null,
      entryNotionalUsdt: t.entryNotionalUsdt
        ? t.entryNotionalUsdt.toString()
        : null,
      openedAt: t.openedAt.toISOString(),
      closeQty: t.closeQty ?? null,
      closePrice: t.closePrice ? t.closePrice.toString() : null,
      closeNotionalUsdt: t.closeNotionalUsdt
        ? t.closeNotionalUsdt.toString()
        : null,
      closedAt: t.closedAt ? t.closedAt.toISOString() : null,
      // 실현 손익 USDT
      profitUsdt: t.realizedPnlUsdt ? t.realizedPnlUsdt.toString() : null,
      // 실현 ROI(%)
      realizedRoiPct: t.realizedRoiPct ? t.realizedRoiPct.toString() : null,
    };
  });

  const botsForSelect = myBots.map((b) => ({ botId: b.id, botName: b.name }));

  return NextResponse.json({
    ok: true,
    data: rows,
    page,
    pageSize: PAGE_SIZE,
    total,
    bots: botsForSelect,
    symbols: allSymbolsForUser,
  });
}
