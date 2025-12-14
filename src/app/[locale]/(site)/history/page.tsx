"use client";

import { useHistoryList } from "./hooks/useHistoryList";
import HistoryPageView from "./view/HistoryPageView";

function Page() {
  const data = useHistoryList();

  return (
    // [수정] 라이트: bg-gray-50/text-gray-900 ↔ 다크: bg-[#0B1222]/text-gray-100
    <div className="min-h-screen p-6 md:p-8 transition-colors duration-300 bg-gray-50 text-gray-900 [:root[data-theme=dark]_&]:bg-[#0B1222] [:root[data-theme=dark]_&]:text-gray-100">
      <HistoryPageView {...data} />
    </div>
  );
}

export default Page;
