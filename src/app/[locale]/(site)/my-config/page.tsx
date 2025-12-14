"use client";

import { MyConfigFormView } from "./components/MyConfigFormView";
import { HistoryTable } from "./components/HistoryTable";
import { useMyConfig } from "./hooks/useMyConfig";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import { useTranslations } from "next-intl";

export default function MyConfigPage() {
  const vm = useMyConfig();
  const t = useTranslations("my-config");

  return (
    // [수정] 라이트: bg-gray-50/text-gray-900 ↔ 다크: bg-[#0B1222]/text-gray-100
    <div className="min-h-screen p-6 md:p-8 transition-colors duration-300 bg-gray-50 text-gray-900 [:root[data-theme=dark]_&]:bg-[#0B1222] [:root[data-theme=dark]_&]:text-gray-100">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* 헤더 */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-[#06b6d4]/10 rounded-lg">
            <UserCircleIcon className="h-8 w-8 text-[#06b6d4]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 [:root[data-theme=dark]_&]:text-white">
              {t("page.title")}
            </h1>
            <p className="text-sm text-gray-500 [:root[data-theme=dark]_&]:text-gray-400">
              {t("page.subtitle")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 왼쪽: 설정 폼 */}
          <div className="lg:col-span-1">
            <MyConfigFormView vm={vm} />
          </div>

          {/* 오른쪽: 히스토리 테이블 */}
          <div className="lg:col-span-2">
            <HistoryTable vm={vm} />
          </div>
        </div>
      </div>
    </div>
  );
}
