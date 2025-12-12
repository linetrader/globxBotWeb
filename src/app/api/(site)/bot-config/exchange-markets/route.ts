// src/app/api/bot-config/exchange-markets/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * 클라이언트 기대 타입(프런트 정의 유지):
 * type ExchangeMarketMeta = {
 *   id: string;
 *   exchangeName: string;
 *   marketName: string; // ExchangeMarket.name ?? code
 *   symbol: string;     // ← ExchangeMarket.code 로 매핑
 * }
 *
 * 쿼리:
 *   GET /api/bot-config/exchange-markets
 *   GET /api/bot-config/exchange-markets?exchangeId=xxxx   // 특정 거래소만
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const exchangeId = searchParams.get("exchangeId") ?? undefined;

  const rows = await prisma.exchangeMarket.findMany({
    where: exchangeId ? { exchangeId } : undefined,
    select: {
      id: true,
      code: true, // SPOT / FUTURES ...
      name: true, // nullable
      active: true,
      exchange: { select: { name: true } }, // Exchange.name
    },
    orderBy: [
      { active: "desc" }, // 활성 우선
      { code: "asc" },
    ],
  });

  // 프런트 타입에 맞춘 변환 (symbol ← code, marketName ← name ?? code)
  const data = rows.map((r) => ({
    id: r.id,
    exchangeName: r.exchange?.name ?? "",
    marketName: r.name && r.name.length > 0 ? r.name : r.code,
    symbol: r.code,
  }));

  return NextResponse.json(data);
}
