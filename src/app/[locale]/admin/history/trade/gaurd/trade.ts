// src/app/admin/history/trade/gaurd/trade.ts
import type {
  TradeRow,
  TradeListResponse,
  TradeStatusFilter,
  TradeStatusVal,
  TradeMarginMode,
  TradeSide,
} from "../types";

function isString(v: unknown): v is string {
  return typeof v === "string";
}

function isNullableString(v: unknown): v is string | null {
  return v === null || typeof v === "string";
}

function isNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

function isNullableNumber(v: unknown): v is number | null {
  return v === null || (typeof v === "number" && Number.isFinite(v));
}

function isTradeSide(v: unknown): v is TradeSide {
  return v === "LONG" || v === "SHORT";
}

function isTradeMarginMode(v: unknown): v is TradeMarginMode {
  return v === "ISOLATED" || v === "CROSS";
}

function isTradeStatusVal(v: unknown): v is TradeStatusVal {
  return v === "OPEN" || v === "CLOSED";
}

export function isTradeStatusFilter(v: unknown): v is TradeStatusFilter {
  return v === "ALL" || v === "OPEN" || v === "CLOSED";
}

function parseRow(raw: unknown): TradeRow | null {
  if (typeof raw !== "object" || raw === null) {
    return null;
  }
  const o = raw as Record<string, unknown>;

  const idOk = isString(o.id);
  const botIdOk = isString(o.botId);
  const symbolOk = isString(o.symbol);
  const sideOk = isTradeSide(o.side);
  const leverageOk = isNumber(o.leverage);
  const marginModeOk = isTradeMarginMode(o.marginMode);
  const statusOk = isTradeStatusVal(o.status);

  const entryQtyOk = isNumber(o.entryQty);
  const entryCostUsdtOk = isNullableString(o.entryCostUsdt);
  const entryPriceOk = isNullableString(o.entryPrice);
  const entryNotionalUsdtOk = isNullableString(o.entryNotionalUsdt);

  const openedAtOk = isString(o.openedAt);

  const closeQtyOk = isNullableNumber(o.closeQty);
  const closePriceOk = isNullableString(o.closePrice);
  const closeNotionalUsdtOk = isNullableString(o.closeNotionalUsdt);

  const realizedPnlUsdtOk = isNullableString(o.realizedPnlUsdt);
  const realizedRoiPctOk = isNullableString(o.realizedRoiPct);

  const closedAtOk = o.closedAt === null || isString(o.closedAt);

  const updatedAtOk = isString(o.updatedAt);

  if (
    !idOk ||
    !botIdOk ||
    !symbolOk ||
    !sideOk ||
    !leverageOk ||
    !marginModeOk ||
    !statusOk ||
    !entryQtyOk ||
    !entryCostUsdtOk ||
    !entryPriceOk ||
    !entryNotionalUsdtOk ||
    !openedAtOk ||
    !closeQtyOk ||
    !closePriceOk ||
    !closeNotionalUsdtOk ||
    !realizedPnlUsdtOk ||
    !realizedRoiPctOk ||
    !closedAtOk ||
    !updatedAtOk
  ) {
    return null;
  }

  return {
    id: o.id,
    botId: o.botId,
    symbol: o.symbol,
    side: o.side,
    leverage: o.leverage,
    marginMode: o.marginMode,
    status: o.status,
    entryQty: o.entryQty,
    entryCostUsdt: o.entryCostUsdt,
    entryPrice: o.entryPrice,
    entryNotionalUsdt: o.entryNotionalUsdt,
    openedAt: o.openedAt,
    closeQty: o.closeQty,
    closePrice: o.closePrice,
    closeNotionalUsdt: o.closeNotionalUsdt,
    realizedPnlUsdt: o.realizedPnlUsdt,
    realizedRoiPct: o.realizedRoiPct,
    closedAt: o.closedAt,
    updatedAt: o.updatedAt,
  } as TradeRow;
}

export function parseTradeListResponse(raw: unknown): TradeListResponse {
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

      if (
        Array.isArray(dataRaw) &&
        isNumber(pageRaw) &&
        isNumber(pageSizeRaw) &&
        isNumber(totalRaw)
      ) {
        const rows: TradeRow[] = [];
        for (const item of dataRaw) {
          const row = parseRow(item);
          if (row) {
            rows.push(row);
          }
        }
        return {
          ok: true,
          data: rows,
          page: pageRaw,
          pageSize: pageSizeRaw,
          total: totalRaw,
        };
      }
    }
  }

  return {
    ok: false,
    error: "INVALID_RESPONSE",
  };
}
