// src/app/admin/history/trade-event/page.tsx
"use client";

import { useTradeEventList } from "./hooks/useTradeEventList";
import TradeEventPageView from "./view/TradeEventPageView";

function Page() {
  const data = useTradeEventList();
  return <TradeEventPageView {...data} />;
}

export default Page;
