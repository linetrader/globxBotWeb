// src/app/admin/history/trade/types/index.ts
export type TradeSide = "LONG" | "SHORT";
export type TradeMarginMode = "ISOLATED" | "CROSS";
export type TradeStatusFilter = "ALL" | "OPEN" | "CLOSED";
export type TradeStatusVal = "OPEN" | "CLOSED";

export interface TradeRow {
  id: string;
  botId: string;
  symbol: string;
  side: TradeSide;
  leverage: number;
  marginMode: TradeMarginMode;
  status: TradeStatusVal;

  entryQty: number;
  entryCostUsdt: string | null;
  entryPrice: string | null;
  entryNotionalUsdt: string | null;

  openedAt: string;

  closeQty: number | null;
  closePrice: string | null;
  closeNotionalUsdt: string | null;

  realizedPnlUsdt: string | null;
  realizedRoiPct: string | null;

  closedAt: string | null;

  updatedAt: string;
}

export type TradeListResponse =
  | {
      ok: true;
      data: TradeRow[];
      page: number;
      pageSize: number;
      total: number;
    }
  | {
      ok: false;
      error: string;
    };

export interface UseTradeListReturn {
  loading: boolean;
  error: string | null;

  rows: TradeRow[];

  page: number;
  pageSize: number;
  total: number;
  setPage: (page: number) => void;

  statusFilter: TradeStatusFilter;
  setStatusFilter: (f: TradeStatusFilter) => void;

  refresh: () => void;
}
