// src/app/(site)/bot-config/hooks/useExchangeMarketOptions.ts
"use client";

import { useEffect, useMemo, useState } from "react";
import { getJson } from "../lib/fetcher";
import { ExchangeMarketMeta } from "../types";
import { isExchangeMarketMeta } from "../gaurd/bot-config";

type State = {
  markets: ExchangeMarketMeta[]; // 전체
  exchangeNames: string[]; // 고유 거래소명
  loading: boolean;
  error?: string;
};

/** GET /api/meta/exchange-markets 만 사용 */
export function useExchangeMarketOptions(endpoint: string): State & {
  marketsByExchangeName: (exchangeName?: string) => ExchangeMarketMeta[];
} {
  const [state, setState] = useState<State>({
    markets: [],
    exchangeNames: [],
    loading: true,
  });

  useEffect(() => {
    let cancel = false;
    async function run() {
      try {
        const raw = await getJson<unknown>(endpoint);
        const rows = Array.isArray(raw) ? raw.filter(isExchangeMarketMeta) : [];
        const namesSet = new Set<string>();
        for (const r of rows) {
          if (r.exchangeName) namesSet.add(r.exchangeName);
        }
        if (!cancel) {
          setState({
            markets: rows,
            exchangeNames: Array.from(namesSet).sort((a, b) =>
              a.localeCompare(b)
            ),
            loading: false,
          });
        }
      } catch {
        if (!cancel) {
          setState({
            markets: [],
            exchangeNames: [],
            loading: false,
            error: "메타 로드 실패",
          });
        }
      }
    }
    run();
    return () => {
      cancel = true;
    };
  }, [endpoint]);

  const marketsByExchangeName = useMemo(() => {
    return (exchangeName?: string) =>
      state.markets.filter((m) =>
        exchangeName ? m.exchangeName === exchangeName : true
      );
  }, [state.markets]);

  return { ...state, marketsByExchangeName };
}
