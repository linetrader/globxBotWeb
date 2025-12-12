// src/app/(site)/history/gaurd/history.ts
import type { HistoryRow, HistoryListResponse, BotOption } from "../types";

function isString(v: unknown): v is string {
  return typeof v === "string";
}

function isNullableString(v: unknown): v is string | null {
  return v === null || typeof v === "string";
}

function isNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

function isSide(v: unknown): v is "LONG" | "SHORT" {
  return v === "LONG" || v === "SHORT";
}

function isStatus(v: unknown): v is "OPEN" | "CLOSED" {
  return v === "OPEN" || v === "CLOSED";
}

// -----------------------------------------
// HistoryRow 파서 (ROI/Profit 없을 때도 허용)
// -----------------------------------------
function parseRow(raw: unknown): HistoryRow | null {
  if (typeof raw !== "object" || raw === null) {
    return null;
  }
  const o = raw as Record<string, unknown>;

  const botIdOk = isString(o.botId);
  const botNameOk = isString(o.botName);

  const exchangeOk = isString(o.exchange);

  const symbolOk = isString(o.symbol);
  const sideOk = isSide(o.side);
  const leverageOk = isNumber(o.leverage);
  const statusOk = isStatus(o.status);

  const entryPriceOk =
    o.entryPrice === undefined || isNullableString(o.entryPrice);
  const entryCostOk =
    o.entryCostUsdt === undefined || isNullableString(o.entryCostUsdt);
  const entryNotionalOk =
    o.entryNotionalUsdt === undefined || isNullableString(o.entryNotionalUsdt);
  const openedAtOk = isString(o.openedAt);

  const closeQtyOk =
    o.closeQty === undefined || o.closeQty === null || isNumber(o.closeQty);
  const closePriceOk =
    o.closePrice === undefined || isNullableString(o.closePrice);
  const closeNotionalOk =
    o.closeNotionalUsdt === undefined || isNullableString(o.closeNotionalUsdt);
  const closedAtOk =
    o.closedAt === undefined || o.closedAt === null || isString(o.closedAt);

  // 실현 손익(USDT) / ROI(%) → 필드가 없을 수도 있으므로 undefined 허용
  const profitOk = o.profitUsdt === undefined || isNullableString(o.profitUsdt);
  const roiOk =
    o.realizedRoiPct === undefined || isNullableString(o.realizedRoiPct);

  if (
    !botIdOk ||
    !botNameOk ||
    !exchangeOk ||
    !symbolOk ||
    !sideOk ||
    !leverageOk ||
    !statusOk ||
    !entryPriceOk ||
    !entryCostOk ||
    !entryNotionalOk ||
    !openedAtOk ||
    !closeQtyOk ||
    !closePriceOk ||
    !closeNotionalOk ||
    !closedAtOk ||
    !profitOk ||
    !roiOk
  ) {
    return null;
  }

  return {
    botId: o.botId as string,
    botName: o.botName as string,

    exchange: o.exchange as string,

    symbol: o.symbol as string,
    side: o.side as "LONG" | "SHORT",
    leverage: o.leverage as number,
    status: o.status as "OPEN" | "CLOSED",

    entryPrice: (o.entryPrice as string | null) ?? null,
    entryCostUsdt: (o.entryCostUsdt as string | null) ?? null,
    entryNotionalUsdt: (o.entryNotionalUsdt as string | null) ?? null,
    openedAt: o.openedAt as string,

    closeQty: (o.closeQty as number | null) ?? null,
    closePrice: (o.closePrice as string | null) ?? null,
    closeNotionalUsdt: (o.closeNotionalUsdt as string | null) ?? null,
    closedAt: (o.closedAt as string | null) ?? null,

    // 없으면 null로 보정
    profitUsdt: (o.profitUsdt as string | null) ?? null,
    realizedRoiPct: (o.realizedRoiPct as string | null) ?? null,
  };
}

// -----------------------------------------
// BotOption 파서
// -----------------------------------------
function isBotOptionLike(
  raw: unknown
): raw is { botId: string; botName: string } {
  if (typeof raw !== "object" || raw === null) {
    return false;
  }
  const o = raw as Record<string, unknown>;
  return isString(o.botId) && isString(o.botName);
}

function parseBotOption(raw: unknown): BotOption | null {
  if (!isBotOptionLike(raw)) {
    return null;
  }
  return {
    botId: raw.botId,
    botName: raw.botName,
  };
}

// -----------------------------------------
// symbols 파서
// -----------------------------------------
function parseStringArray(raw: unknown): string[] | null {
  if (!Array.isArray(raw)) {
    return null;
  }
  const out: string[] = [];
  for (const item of raw) {
    if (typeof item === "string") {
      out.push(item);
    } else {
      return null;
    }
  }
  return out;
}

// -----------------------------------------
// 전체 응답 파서
// -----------------------------------------
export function parseHistoryListResponse(raw: unknown): HistoryListResponse {
  if (typeof raw === "object" && raw !== null) {
    const o = raw as Record<string, unknown>;

    if (o.ok === false) {
      const err =
        typeof o.error === "string" && o.error.length > 0
          ? o.error
          : "UNKNOWN_ERROR";

      return {
        ok: false,
        error: err,
      };
    }

    if (o.ok === true) {
      const dataRaw = o.data;
      const pageRaw = o.page;
      const pageSizeRaw = o.pageSize;
      const totalRaw = o.total;
      const botsRaw = o.bots;
      const symbolsRaw = o.symbols;

      if (
        Array.isArray(dataRaw) &&
        isNumber(pageRaw) &&
        isNumber(pageSizeRaw) &&
        isNumber(totalRaw) &&
        Array.isArray(botsRaw)
      ) {
        const rowsParsed: HistoryRow[] = [];
        for (const item of dataRaw) {
          const row = parseRow(item);
          if (row) rowsParsed.push(row);
        }

        const botsParsed: BotOption[] = [];
        for (const b of botsRaw) {
          const opt = parseBotOption(b);
          if (opt) botsParsed.push(opt);
        }

        const symbolsParsed = parseStringArray(symbolsRaw) ?? [];

        return {
          ok: true,
          data: rowsParsed,
          page: pageRaw,
          pageSize: pageSizeRaw,
          total: totalRaw,
          bots: botsParsed,
          symbols: symbolsParsed,
        };
      }
    }
  }

  return {
    ok: false,
    error: "INVALID_RESPONSE",
  };
}
