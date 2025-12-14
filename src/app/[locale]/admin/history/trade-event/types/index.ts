// src/app/admin/history/trade-event/types/index.ts
export type TradeEventTypeVal =
  | "ENTRY"
  | "PARTIAL_EXIT"
  | "EXIT"
  | "LIQUIDATION";

export type TradeEventSide = "LONG" | "SHORT";
export type TradeEventMarginMode = "ISOLATED" | "CROSS";

export interface TradeEventRow {
  id: string;
  tradeId: string;
  type: TradeEventTypeVal;
  timestamp: string;

  botId: string;
  exchangeMarketId: string;
  exchangeCredentialId: string | null;

  symbol: string;
  side: TradeEventSide;
  leverage: number;
  marginMode: TradeEventMarginMode;

  qty: number;

  price: string | null;
  notionalUsdt: string | null;
  costUsdt: string | null;

  realizedPnlUsdt: string | null;
  realizedRoiPct: string | null;

  createdAt: string;
}

export type TradeEventListResponse =
  | {
      ok: true;
      data: TradeEventRow[];
      page: number;
      pageSize: number;
      total: number;
    }
  | {
      ok: false;
      error: string;
    };

export interface UseTradeEventListReturn {
  loading: boolean;
  error: string | null;

  rows: TradeEventRow[];

  page: number;
  pageSize: number;
  total: number;
  setPage: (page: number) => void;

  botFilter: string;
  setBotFilter: (id: string) => void;

  tradeFilter: string;
  setTradeFilter: (id: string) => void;

  refresh: () => void;
}
