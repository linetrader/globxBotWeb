// src/app/admin/history/trade-event/gaurd/tradeEvent.ts
import type {
  TradeEventRow,
  TradeEventListResponse,
  TradeEventTypeVal,
  TradeEventSide,
  TradeEventMarginMode,
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

function isTradeEventType(v: unknown): v is TradeEventTypeVal {
  return (
    v === "ENTRY" || v === "PARTIAL_EXIT" || v === "EXIT" || v === "LIQUIDATION"
  );
}

function isSide(v: unknown): v is TradeEventSide {
  return v === "LONG" || v === "SHORT";
}

function isMarginMode(v: unknown): v is TradeEventMarginMode {
  return v === "ISOLATED" || v === "CROSS";
}

function parseRow(raw: unknown): TradeEventRow | null {
  if (typeof raw !== "object" || raw === null) {
    return null;
  }

  const o = raw as Record<string, unknown>;

  const idOk = isString(o.id);
  const tradeIdOk = isString(o.tradeId);
  const typeOk = isTradeEventType(o.type);
  const timestampOk = isString(o.timestamp);

  const botIdOk = isString(o.botId);
  const exchangeMarketIdOk = isString(o.exchangeMarketId);
  const exchangeCredentialIdOk = isNullableString(o.exchangeCredentialId);

  const symbolOk = isString(o.symbol);
  const sideOk = isSide(o.side);
  const leverageOk = isNumber(o.leverage);
  const marginModeOk = isMarginMode(o.marginMode);

  const qtyOk = isNumber(o.qty);

  const priceOk = isNullableString(o.price);
  const notionalOk = isNullableString(o.notionalUsdt);
  const costOk = isNullableString(o.costUsdt);

  const pnlOk = isNullableString(o.realizedPnlUsdt);
  const roiOk = isNullableString(o.realizedRoiPct);

  const createdAtOk = isString(o.createdAt);

  if (
    !idOk ||
    !tradeIdOk ||
    !typeOk ||
    !timestampOk ||
    !botIdOk ||
    !exchangeMarketIdOk ||
    !exchangeCredentialIdOk ||
    !symbolOk ||
    !sideOk ||
    !leverageOk ||
    !marginModeOk ||
    !qtyOk ||
    !priceOk ||
    !notionalOk ||
    !costOk ||
    !pnlOk ||
    !roiOk ||
    !createdAtOk
  ) {
    return null;
  }

  return {
    id: o.id,
    tradeId: o.tradeId,
    type: o.type,
    timestamp: o.timestamp,
    botId: o.botId,
    exchangeMarketId: o.exchangeMarketId,
    exchangeCredentialId: o.exchangeCredentialId,
    symbol: o.symbol,
    side: o.side,
    leverage: o.leverage,
    marginMode: o.marginMode,
    qty: o.qty,
    price: o.price,
    notionalUsdt: o.notionalUsdt,
    costUsdt: o.costUsdt,
    realizedPnlUsdt: o.realizedPnlUsdt,
    realizedRoiPct: o.realizedRoiPct,
    createdAt: o.createdAt,
  } as TradeEventRow;
}

export function parseTradeEventListResponse(
  raw: unknown
): TradeEventListResponse {
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
        const rows: TradeEventRow[] = [];
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
