// src/types/options.ts
export type MarketCode = "SPOT" | "FUTURES";

export type ExchangeOption = {
  id: string;
  code: string;
  name: string;
};

export type MarketOption = {
  id: string;
  exchangeId: string;
  code: MarketCode;
  name: string;
  restBaseUrl: string;
};

export type SymbolOption = { value: string; label: string };

export type TimeframeEnum =
  | "T1m"
  | "T3m"
  | "T5m"
  | "T15m"
  | "T30m"
  | "T1h"
  | "T4h"
  | "T1d";

export const EXCHANGES: ReadonlyArray<ExchangeOption> = [
  { id: "ex_gateio", code: "GATEIO", name: "Gate.io" },
  { id: "ex_websea", code: "WEBSEA", name: "WebSea" },
  { id: "ex_kucoin", code: "KUCOIN", name: "KuCoin" },
  { id: "ex_wallst", code: "WALLST", name: "wallST" },
  { id: "ex_ordery", code: "ORDERY", name: "Orderly" },
];

export const MARKETS: ReadonlyArray<MarketOption> = [
  {
    id: "mkt_gateio_spot",
    exchangeId: "ex_gateio",
    code: "SPOT",
    name: "Gate.io Spot",
    restBaseUrl: "https://api.gateio.ws/api/v4",
  },
  {
    id: "mkt_gateio_futures",
    exchangeId: "ex_gateio",
    code: "FUTURES",
    name: "Gate.io Futures",
    restBaseUrl: "https://fx-api.gateio.ws/api/v4",
  },
  {
    id: "mkt_websea_spot",
    exchangeId: "ex_websea",
    code: "SPOT",
    name: "WebSea Spot",
    restBaseUrl: "https://oapi.websea.com",
  },
  {
    id: "mkt_websea_futures",
    exchangeId: "ex_websea",
    code: "FUTURES",
    name: "WebSea Futures",
    restBaseUrl: "https://coapi.websea.com",
  },

  // KuCoin Spot / Futures
  // - Spot & Margin REST: https://api.kucoin.com
  // - Futures REST:      https://api-futures.kucoin.com
  {
    id: "mkt_kucoin_spot",
    exchangeId: "ex_kucoin",
    code: "SPOT",
    name: "KuCoin Spot",
    restBaseUrl: "https://api.kucoin.com",
  },
  {
    id: "mkt_kucoin_futures",
    exchangeId: "ex_kucoin",
    code: "FUTURES",
    name: "KuCoin Futures",
    restBaseUrl: "https://api-futures.kucoin.com",
  },

  {
    id: "mkt_wallst_spot",
    exchangeId: "ex_wallst",
    code: "SPOT",
    name: "wallST Spot",
    // ⚠️ 실제 wallST Spot REST Base URL 로 교체 필요
    restBaseUrl: "https://example.wallst.com/api/spot",
  },
  {
    id: "mkt_wallst_futures",
    exchangeId: "ex_wallst",
    code: "FUTURES",
    name: "wallST Futures",
    // ⚠️ 실제 wallST Futures REST Base URL 로 교체 필요
    restBaseUrl: "https://example.wallst.com/api/futures",
  },
  // Orderly Perps (FUTURES)
  {
    id: "mkt_ordery_futures",
    exchangeId: "ex_ordery",
    code: "FUTURES",
    name: "Orderly Perps",
    restBaseUrl: "https://api.orderly.org",
  },
];

export const SYMBOLS_BY_MARKET: Readonly<
  Record<string, ReadonlyArray<SymbolOption>>
> = {
  mkt_gateio_spot: [
    { value: "BTCUSDT", label: "BTC/USDT" },
    { value: "ETHUSDT", label: "ETH/USDT" },
  ],
  mkt_gateio_futures: [
    { value: "BTCUSDT", label: "BTC/USDT" },
    { value: "SOLUSDT", label: "SOL/USDT" },
  ],
  mkt_websea_spot: [
    { value: "BTCUSDT", label: "BTC/USDT" },
    { value: "XRPUSDT", label: "XRP/USDT" },
  ],
  mkt_websea_futures: [
    { value: "BTCUSDT", label: "BTC/USDT" },
    { value: "ETHUSDT", label: "ETH/USDT" },
  ],

  // KuCoin 심볼 (예시)
  // KuCoin Spot 심볼은 원래 "BTC-USDT" 포맷이지만,
  // 현재 프로젝트는 "BTCUSDT" 포맷을 사용 중이라 여기에 맞춤.
  mkt_kucoin_spot: [
    { value: "BTCUSDT", label: "BTC/USDT" },
    { value: "ETHUSDT", label: "ETH/USDT" },
  ],
  mkt_kucoin_futures: [
    { value: "BTCUSDT", label: "BTC/USDT" },
    { value: "ETHUSDT", label: "ETH/USDT" },
  ],

  // 아래 wallST 심볼은 예시 값. 실제 지원 심볼로 교체 필요
  mkt_wallst_spot: [
    { value: "BTCUSDT", label: "BTC/USDT" },
    { value: "ETHUSDT", label: "ETH/USDT" },
  ],
  mkt_wallst_futures: [
    { value: "BTCUSDT", label: "BTC/USDT" },
    { value: "ETHUSDT", label: "ETH/USDT" },
  ],

  // Orderly Perps 심볼 (예시)
  mkt_ordery_futures: [
    { value: "PERP_BTC_USDC", label: "BTC-PERP (USDC)" },
    { value: "PERP_ETH_USDC", label: "ETH-PERP (USDC)" },
  ],
};

export const TIMEFRAMES: ReadonlyArray<{
  value: TimeframeEnum;
  label: string;
}> = [
  { value: "T1m", label: "1m" },
  { value: "T3m", label: "3m" },
  { value: "T5m", label: "5m" },
  { value: "T15m", label: "15m" },
  { value: "T30m", label: "30m" },
  { value: "T1h", label: "1h" },
  { value: "T4h", label: "4h" },
  { value: "T1d", label: "1d" },
];
