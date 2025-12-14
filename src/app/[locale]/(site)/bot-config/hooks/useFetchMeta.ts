// src/hooks/useFetchMeta.ts
"use client";

import { useEffect, useState } from "react";
import { getJson } from "../lib/fetcher";
import { ExchangeMarketMeta, StrategyConfigMeta } from "../types";
import {
  isExchangeMarketMeta,
  isStrategyConfigMeta,
} from "../gaurd/bot-config";

type MetaState = {
  exchanges: ExchangeMarketMeta[];
  strategies: StrategyConfigMeta[];
  loading: boolean;
  error?: string;
};

export function useFetchMeta(
  metaEndpointExchanges: string,
  metaEndpointStrategies: string
): MetaState {
  const [state, setState] = useState<MetaState>({
    exchanges: [],
    strategies: [],
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const [exRaw, stRaw] = await Promise.all([
          getJson<unknown>(metaEndpointExchanges),
          getJson<unknown>(metaEndpointStrategies),
        ]);

        const exArr = Array.isArray(exRaw)
          ? exRaw.filter(isExchangeMarketMeta)
          : [];
        const stArr = Array.isArray(stRaw)
          ? stRaw.filter(isStrategyConfigMeta)
          : [];

        if (!cancelled) {
          setState({ exchanges: exArr, strategies: stArr, loading: false });
        }
      } catch {
        if (!cancelled) {
          setState({
            exchanges: [],
            strategies: [],
            loading: false,
            error: "메타 데이터를 불러오지 못했습니다.",
          });
        }
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [metaEndpointExchanges, metaEndpointStrategies]);

  return state;
}
