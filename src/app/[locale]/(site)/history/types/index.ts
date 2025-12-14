// src/app/(site)/history/types/index.ts
// 사용자가 보는 히스토리 한 행
export interface HistoryRow {
  botId: string;
  botName: string;

  // 거래소 (예: "gateio", "websea")
  exchange: string;

  symbol: string;
  side: "LONG" | "SHORT";
  leverage: number;
  status: "OPEN" | "CLOSED";

  // ※ entryQty 제거
  entryPrice: string | null;
  entryCostUsdt: string | null;
  entryNotionalUsdt: string | null;
  openedAt: string;

  closeQty: number | null;
  closePrice: string | null;
  closeNotionalUsdt: string | null;
  closedAt: string | null;

  // 실현 손익 (realizedPnlUsdt)
  profitUsdt: string | null;

  // 실현 ROI (%). 서버가 DB값을 문자열로 내려줌.
  realizedRoiPct: string | null;
}

// 셀렉트 박스에 쓸 봇 옵션
export interface BotOption {
  botId: string;
  botName: string;
}

export type HistoryListResponse =
  | {
      ok: true;
      data: HistoryRow[];
      page: number;
      pageSize: number;
      total: number;
      bots: BotOption[];
      symbols: string[];
    }
  | {
      ok: false;
      error: string;
    };

// 훅에서 외부로 노출하는 값들
export interface UseHistoryListReturn {
  loading: boolean;
  error: string | null;

  rows: HistoryRow[];

  page: number;
  pageSize: number;
  total: number;
  setPage: (page: number) => void;

  botIdFilter: string;
  setBotIdFilter: (botId: string) => void;

  symbolFilter: string;
  setSymbolFilter: (symbol: string) => void;

  botOptions: BotOption[];
  symbolOptions: string[];

  refresh: () => void;
}
