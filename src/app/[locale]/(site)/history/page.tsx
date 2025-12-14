// src/app/(site)/history/page.tsx
"use client";

import { useHistoryList } from "./hooks/useHistoryList";
import HistoryPageView from "./view/HistoryPageView";

function Page() {
  const data = useHistoryList();
  return <HistoryPageView {...data} />;
}

export default Page;
