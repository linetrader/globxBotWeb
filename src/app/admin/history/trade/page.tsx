// src/app/admin/history/trade/page.tsx
"use client";

import { useTradeList } from "./hooks/useTradeList";
import TradePageView from "./view/TradePageView";

function Page() {
  const data = useTradeList();
  return <TradePageView {...data} />;
}

export default Page;
