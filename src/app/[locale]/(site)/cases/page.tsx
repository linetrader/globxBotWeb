"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  ArrowRightIcon,
  ChartBarIcon,
  HashtagIcon,
} from "@heroicons/react/24/outline";

type CaseItem = {
  id: string;
  titleKey: string;
  descKey: string;
  statKey: string;
  tagKey: string;
};

export default function CasesPage() {
  const t = useTranslations("cases");

  const items: CaseItem[] = useMemo(
    () => [
      {
        id: "case1",
        titleKey: "items.case1.title",
        descKey: "items.case1.desc",
        statKey: "items.case1.stat",
        tagKey: "items.case1.tag",
      },
      {
        id: "case2",
        titleKey: "items.case2.title",
        descKey: "items.case2.desc",
        statKey: "items.case2.stat",
        tagKey: "items.case2.tag",
      },
      {
        id: "case3",
        titleKey: "items.case3.title",
        descKey: "items.case3.desc",
        statKey: "items.case3.stat",
        tagKey: "items.case3.tag",
      },
    ],
    []
  );

  const tags = useMemo(
    () => ["all", "pro", "beginner", "longterm"] as const,
    []
  );
  type Tag = (typeof tags)[number];

  const [active, setActive] = useState<Tag>("all");

  const filtered = useMemo(() => {
    if (active === "all") return items;
    return items.filter((it) => t(it.tagKey) === t(`tags.${active}`));
  }, [active, items, t]);

  return (
    // [수정] dark: 대신 DaisyUI data-theme 감지 선택자 사용
    // 라이트: bg-gray-50 / 다크: bg-[#0B1222]
    <main className="min-h-screen pb-20 transition-colors duration-300 bg-gray-50 text-gray-900 [:root[data-theme=dark]_&]:bg-[#0B1222] [:root[data-theme=dark]_&]:text-gray-100">
      {/* 1. 헤더 섹션 */}
      <section className="pt-20 pb-12 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 [:root[data-theme=dark]_&]:text-white">
            {t("title")}
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto [:root[data-theme=dark]_&]:text-gray-400">
            {t("subtitle")}
          </p>
        </div>
      </section>

      {/* 2. 필터 섹션 */}
      <section className="container mx-auto px-4 mb-12">
        <div className="flex flex-wrap justify-center gap-2 md:gap-4">
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setActive(tag)}
              className={`
                px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 border
                ${
                  active === tag
                    ? // 활성 상태 (공통)
                      "bg-[#06b6d4] border-[#06b6d4] text-white shadow-lg shadow-cyan-500/20"
                    : // 비활성 상태: 라이트 <-> 다크 분기
                      "bg-white border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900 [:root[data-theme=dark]_&]:bg-[#131B2D] [:root[data-theme=dark]_&]:border-gray-700 [:root[data-theme=dark]_&]:text-gray-400 [:root[data-theme=dark]_&]:hover:border-gray-500 [:root[data-theme=dark]_&]:hover:text-gray-200"
                }
              `}
            >
              {t(`tags.${tag}`)}
            </button>
          ))}
        </div>
      </section>

      {/* 3. 카드 리스트 섹션 */}
      <section className="container mx-auto px-4 max-w-6xl">
        {/* 결과 없음 처리 */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 border border-dashed rounded-2xl bg-white/50 border-gray-300 [:root[data-theme=dark]_&]:bg-[#131B2D]/50 [:root[data-theme=dark]_&]:border-gray-700">
            <p className="text-gray-500 [:root[data-theme=dark]_&]:text-gray-400">
              해당하는 사례가 없습니다.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((it) => (
              <article
                key={it.id}
                className="
                  group relative flex flex-col h-full rounded-2xl overflow-hidden 
                  transition-all duration-300 border
                  hover:shadow-xl hover:translate-y-[-2px]
                  /* 라이트 모드 스타일 */
                  bg-white border-gray-200 hover:shadow-gray-200 hover:border-[#06b6d4]/50
                  /* 다크 모드 스타일 (data-theme 감지) */
                  [:root[data-theme=dark]_&]:bg-[#131B2D] [:root[data-theme=dark]_&]:border-gray-800 [:root[data-theme=dark]_&]:hover:shadow-cyan-900/10 [:root[data-theme=dark]_&]:hover:border-[#06b6d4]/50
                "
              >
                {/* 카드 상단 장식 바 (공통) */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />

                <div className="p-6 flex flex-col flex-grow">
                  {/* 태그 영역 */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-[#06b6d4] tracking-wider uppercase bg-[#06b6d4]/10 px-2 py-1 rounded">
                      <HashtagIcon className="h-3 w-3" />
                      {t(it.tagKey)}
                    </span>
                    {/* 샘플 뱃지 */}
                    <span className="text-[10px] px-1.5 py-0.5 rounded border text-gray-500 border-gray-200 [:root[data-theme=dark]_&]:text-gray-400 [:root[data-theme=dark]_&]:border-gray-700">
                      {t("badge.sample")}
                    </span>
                  </div>

                  {/* 제목 */}
                  <h3 className="text-xl font-bold mb-3 transition-colors text-gray-900 group-hover:text-[#06b6d4] [:root[data-theme=dark]_&]:text-white [:root[data-theme=dark]_&]:group-hover:text-[#06b6d4]">
                    {t(it.titleKey)}
                  </h3>

                  {/* 설명 */}
                  <p className="text-sm leading-relaxed mb-6 flex-grow text-gray-600 [:root[data-theme=dark]_&]:text-gray-400">
                    {t(it.descKey)}
                  </p>

                  {/* 통계/결과 박스 */}
                  <div className="rounded-xl p-4 border mb-6 flex items-start gap-3 bg-gray-50 border-gray-100 [:root[data-theme=dark]_&]:bg-[#0B1222] [:root[data-theme=dark]_&]:border-gray-700/50">
                    <ChartBarIcon className="h-6 w-6 text-[#06b6d4] mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs text-gray-500 mb-1">
                        {t("statLabel")}
                      </div>
                      <div className="text-base font-bold text-gray-900 [:root[data-theme=dark]_&]:text-white">
                        {t(it.statKey)}
                      </div>
                    </div>
                  </div>

                  {/* 하단 버튼 */}
                  <div className="mt-auto">
                    <button
                      type="button"
                      className="w-full inline-flex items-center justify-center gap-2 text-sm font-semibold py-2 transition-colors text-gray-500 group-hover:text-gray-900 [:root[data-theme=dark]_&]:text-gray-300 [:root[data-theme=dark]_&]:group-hover:text-white"
                    >
                      {t("actions.readMore")}
                      <ArrowRightIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* 4. 하단 안내 문구 */}
      <section className="container mx-auto px-4 mt-16 text-center">
        <p className="text-xs max-w-2xl mx-auto border-t pt-8 text-gray-500 border-gray-200 [:root[data-theme=dark]_&]:text-gray-600 [:root[data-theme=dark]_&]:border-gray-800">
          {t("footer.notice")}
        </p>
      </section>
    </main>
  );
}
