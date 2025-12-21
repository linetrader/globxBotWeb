"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  ArrowRightIcon,
  ChartBarIcon,
  CpuChipIcon, // GlobX 메인 아이콘
  BoltIcon, // GlobX 장식 아이콘
} from "@heroicons/react/24/outline";

type CaseItem = {
  id: string;
  titleKey: string;
  descKey: string;
  statKey: string;
  tagKey: string;
};

export function GlobxView() {
  const t = useTranslations("cases");
  const brandKey = "GlobX"; // GlobX로 설정

  // GlobX 전용 데이터 (JSON 경로: cases.GlobX.items...)
  const items: CaseItem[] = useMemo(
    () => [
      {
        id: "case1",
        titleKey: `${brandKey}.items.case1.title`,
        descKey: `${brandKey}.items.case1.desc`,
        statKey: `${brandKey}.items.case1.stat`,
        tagKey: `${brandKey}.items.case1.tag`,
      },
      {
        id: "case2",
        titleKey: `${brandKey}.items.case2.title`,
        descKey: `${brandKey}.items.case2.desc`,
        statKey: `${brandKey}.items.case2.stat`,
        tagKey: `${brandKey}.items.case2.tag`,
      },
      {
        id: "case3",
        titleKey: `${brandKey}.items.case3.title`,
        descKey: `${brandKey}.items.case3.desc`,
        statKey: `${brandKey}.items.case3.stat`,
        tagKey: `${brandKey}.items.case3.tag`,
      },
    ],
    []
  );

  // GlobX 전용 태그 (JSON 경로: cases.GlobX.tags...)
  const tags = useMemo(
    () => ["all", "arbitrage", "scalping", "volatility"] as const,
    []
  );

  const [active, setActive] = useState<string>("all");

  const filtered = useMemo(() => {
    if (active === "all") return items;
    return items.filter(
      (it) => t(it.tagKey) === t(`${brandKey}.tags.${active}`)
    );
  }, [active, items, t]);

  return (
    <main className="min-h-screen pb-20 transition-colors duration-300 bg-gray-50 text-gray-900 [:root[data-theme=dark]_&]:bg-[#0B1222] [:root[data-theme=dark]_&]:text-gray-100">
      {/* 1. 헤더 섹션 (GlobX - Cyan 테마 적용) */}
      <section className="pt-24 pb-12 px-4 text-center relative overflow-hidden">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 opacity-[0.03] pointer-events-none">
          <CpuChipIcon className="w-96 h-96" />
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="flex justify-center mb-4">
            <span className="px-3 py-1 rounded-full text-xs font-bold border bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-800 opacity-80 uppercase tracking-widest">
              GlobX Case Study
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-6 text-gray-900 [:root[data-theme=dark]_&]:text-white">
            {t(`${brandKey}.title`)}
          </h1>
          <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto [:root[data-theme=dark]_&]:text-gray-400">
            {t(`${brandKey}.subtitle`)}
          </p>
        </div>
      </section>

      {/* 2. 필터 섹션 */}
      <section className="container mx-auto px-4 mb-12">
        <div className="flex flex-wrap justify-center gap-2 md:gap-3">
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setActive(tag)}
              className={`
                px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 border
                ${
                  active === tag
                    ? "bg-[#06b6d4] border-[#06b6d4] text-white shadow-lg shadow-cyan-500/20"
                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900 [:root[data-theme=dark]_&]:bg-[#131B2D] [:root[data-theme=dark]_&]:border-gray-700 [:root[data-theme=dark]_&]:text-gray-400 [:root[data-theme=dark]_&]:hover:border-gray-500 [:root[data-theme=dark]_&]:hover:text-gray-200"
                }
              `}
            >
              {t(`${brandKey}.tags.${tag}`)}
            </button>
          ))}
        </div>
      </section>

      {/* 3. 카드 리스트 섹션 */}
      <section className="container mx-auto px-4 max-w-6xl">
        {filtered.length === 0 ? (
          <div className="text-center py-24 border border-dashed rounded-3xl bg-white/50 border-gray-300 [:root[data-theme=dark]_&]:bg-[#131B2D]/50 [:root[data-theme=dark]_&]:border-gray-700">
            <p className="text-gray-500 [:root[data-theme=dark]_&]:text-gray-400">
              해당하는 사례가 없습니다.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((it) => (
              <article
                key={it.id}
                className="
                  group relative flex flex-col h-full rounded-3xl overflow-hidden 
                  transition-all duration-300 border
                  hover:translate-y-[-4px] hover:shadow-xl
                  bg-white border-gray-100 hover:shadow-gray-200
                  [:root[data-theme=dark]_&]:bg-[#131B2D] [:root[data-theme=dark]_&]:border-gray-800 
                  [:root[data-theme=dark]_&]:hover:shadow-cyan-900/20
                  hover:border-[#06b6d4]/50 hover:shadow-cyan-500/10
                "
              >
                {/* 상단 그라데이션: Cyan 계열 */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-cyan-500 to-blue-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />

                <div className="p-7 flex flex-col flex-grow">
                  <div className="flex items-center justify-between mb-5">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase px-2.5 py-1 rounded-md bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300">
                      <BoltIcon className="h-3.5 w-3.5" />
                      {t(it.tagKey)}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full border font-medium text-gray-500 border-gray-200 [:root[data-theme=dark]_&]:text-gray-400 [:root[data-theme=dark]_&]:border-gray-700">
                      {t("common.badge")}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold mb-3 transition-colors text-gray-900 group-hover:text-[#06b6d4] [:root[data-theme=dark]_&]:text-white">
                    {t(it.titleKey)}
                  </h3>

                  <p className="text-sm leading-relaxed mb-8 flex-grow text-gray-600 [:root[data-theme=dark]_&]:text-gray-400">
                    {t(it.descKey)}
                  </p>

                  <div className="rounded-2xl p-4 border mb-6 flex items-start gap-4 bg-gray-50/80 border-gray-100 [:root[data-theme=dark]_&]:bg-[#0B1222]/80 [:root[data-theme=dark]_&]:border-gray-700/50">
                    <div className="p-2 rounded-lg bg-white shadow-sm border border-gray-100 [:root[data-theme=dark]_&]:bg-[#1A2333] [:root[data-theme=dark]_&]:border-gray-700 text-[#06b6d4]">
                      <ChartBarIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-0.5">
                        {t("common.statLabel")}
                      </div>
                      <div className="text-lg font-bold text-gray-900 [:root[data-theme=dark]_&]:text-white">
                        {t(it.statKey)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto pt-4 border-t border-gray-100 [:root[data-theme=dark]_&]:border-gray-800">
                    <button
                      type="button"
                      className="w-full inline-flex items-center justify-between text-sm font-bold py-1 transition-colors text-gray-500 hover:text-[#06b6d4] [:root[data-theme=dark]_&]:text-gray-400"
                    >
                      {t("common.actions.readMore")}
                      <ArrowRightIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="container mx-auto px-4 mt-20 text-center">
        <p className="text-xs max-w-2xl mx-auto border-t pt-8 text-gray-400 border-gray-200 [:root[data-theme=dark]_&]:text-gray-600 [:root[data-theme=dark]_&]:border-gray-800">
          {t("common.footer.notice")}
        </p>
      </section>
    </main>
  );
}
