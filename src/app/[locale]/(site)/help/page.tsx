// src/app/[locale]/(site)/help/page.tsx

"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  MagnifyingGlassIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";

// 질문 항목 타입
type FaqItem = {
  id: string;
  qKey: string;
  aKey: string;
};

// 카테고리 타입
type FaqCategory = {
  id: string;
  titleKey: string;
  items: FaqItem[];
};

export default function HelpPage() {
  const t = useTranslations("help");

  // 검색어 상태
  const [searchTerm, setSearchTerm] = useState("");
  // 현재 열려있는 아코디언 ID
  const [openItemId, setOpenItemId] = useState<string | null>(null);

  // 데이터 정의
  const categories: FaqCategory[] = useMemo(
    () => [
      {
        id: "program",
        titleKey: "categories.program",
        items: [
          { id: "p1", qKey: "qna.program_q1", aKey: "qna.program_a1" },
          { id: "p2", qKey: "qna.program_q2", aKey: "qna.program_a2" },
          { id: "p3", qKey: "qna.program_q3", aKey: "qna.program_a3" },
          { id: "p4", qKey: "qna.program_q4", aKey: "qna.program_a4" },
        ],
      },
      {
        id: "account",
        titleKey: "categories.account",
        items: [
          { id: "a1", qKey: "qna.account_q1", aKey: "qna.account_a1" },
          { id: "a2", qKey: "qna.account_q2", aKey: "qna.account_a2" },
        ],
      },
      {
        id: "trading",
        titleKey: "categories.trading",
        items: [
          { id: "t1", qKey: "qna.trading_q1", aKey: "qna.trading_a1" },
          { id: "t2", qKey: "qna.trading_q2", aKey: "qna.trading_a2" },
          { id: "t3", qKey: "qna.trading_q3", aKey: "qna.trading_a3" },
          { id: "t4", qKey: "qna.trading_q4", aKey: "qna.trading_a4" },
        ],
      },
      {
        id: "funds",
        titleKey: "categories.funds",
        items: [
          { id: "f1", qKey: "qna.funds_q1", aKey: "qna.funds_a1" },
          { id: "f2", qKey: "qna.funds_q2", aKey: "qna.funds_a2" },
          { id: "f3", qKey: "qna.funds_q3", aKey: "qna.funds_a3" },
        ],
      },
      {
        id: "data",
        titleKey: "categories.data",
        items: [{ id: "d1", qKey: "qna.data_q1", aKey: "qna.data_a1" }],
      },
    ],
    []
  );

  // 아코디언 토글 함수
  const toggleItem = (id: string) => {
    setOpenItemId((prev) => (prev === id ? null : id));
  };

  // 검색 필터링 로직
  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return categories;

    const lowerTerm = searchTerm.toLowerCase();

    return categories
      .map((cat) => {
        const matchedItems = cat.items.filter((item) => {
          const qText = t(item.qKey).toLowerCase();
          const aText = t(item.aKey).toLowerCase();
          return qText.includes(lowerTerm) || aText.includes(lowerTerm);
        });

        const titleMatch = t(cat.titleKey).toLowerCase().includes(lowerTerm);

        if (matchedItems.length > 0 || titleMatch) {
          return {
            ...cat,
            items: matchedItems.length > 0 ? matchedItems : cat.items,
          };
        }
        return null;
      })
      .filter((cat) => cat !== null) as FaqCategory[];
  }, [categories, searchTerm, t]);

  return (
    // [수정] 배경/텍스트: 라이트모드(흰색/검정) <-> 다크모드(기존 색상)
    <main className="min-h-screen pb-20 bg-gray-50 text-gray-900 transition-colors duration-300 [:root[data-theme=dark]_&]:bg-[#0B1222] [:root[data-theme=dark]_&]:text-gray-100">
      {/* ========================================================================
        1. 상단 헤더 & 검색 영역
        ========================================================================
      */}
      <section className="pt-20 pb-12 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          {/* [수정] 헤더 텍스트 색상 대응 */}
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-gray-900 [:root[data-theme=dark]_&]:text-white">
            {t("header.title")}
          </h1>
          <p className="text-gray-500 mb-8 [:root[data-theme=dark]_&]:text-gray-400">
            {t("header.subtitle")}
          </p>

          {/* 검색 바 */}
          <div className="relative max-w-2xl mx-auto flex items-center w-full">
            <div className="relative flex-1">
              {/* [수정] 입력창 배경/테두리/텍스트 색상 대응 */}
              <input
                type="text"
                placeholder={t("header.searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-14 border border-gray-300 border-r-0 rounded-l-lg pl-12 pr-4 
                  bg-white text-gray-900 placeholder-gray-400
                  focus:outline-none focus:border-[#06b6d4] focus:z-10 transition-colors
                  [:root[data-theme=dark]_&]:bg-[#131B2D] 
                  [:root[data-theme=dark]_&]:border-gray-700 
                  [:root[data-theme=dark]_&]:text-gray-100 
                  [:root[data-theme=dark]_&]:placeholder-gray-500"
              />
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 [:root[data-theme=dark]_&]:text-gray-500" />
            </div>

            {/* 검색 버튼 (민트색 유지) */}
            <button
              className="h-14 bg-[#06b6d4] hover:bg-[#0891b2] text-white font-medium px-8 rounded-r-lg transition-colors border border-[#06b6d4] 
              shrink-0 whitespace-nowrap"
            >
              {t("header.searchButton")}
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================
        2. FAQ 메인 콘텐츠 영역
        ========================================================================
      */}
      <section className="max-w-4xl mx-auto px-4">
        {/* 섹션 헤더 */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">{t("faq.title")}</h2>
          <p className="text-gray-500 text-sm [:root[data-theme=dark]_&]:text-gray-400">
            {t("faq.subtitle")}
          </p>
        </div>

        {/* 결과 없음 */}
        {filteredCategories.length === 0 && (
          <div className="text-center py-12 text-gray-500 border border-gray-200 rounded-lg [:root[data-theme=dark]_&]:border-gray-800">
            검색 결과가 없습니다.
          </div>
        )}

        {/* 카테고리 반복 */}
        <div className="space-y-10">
          {filteredCategories.map((cat) => (
            <div key={cat.id}>
              {/* 카테고리 제목 */}
              <h3 className="font-medium mb-3 pl-1 text-sm md:text-base text-gray-700 [:root[data-theme=dark]_&]:text-gray-300">
                {t(cat.titleKey)}
              </h3>

              <div className="space-y-3">
                {cat.items.map((item) => {
                  const isOpen = openItemId === item.id;
                  return (
                    // [수정] 아코디언 배경/테두리 색상 대응
                    <div
                      key={item.id}
                      className="rounded-lg overflow-hidden border transition-all duration-200
                        bg-white border-gray-200 
                        [:root[data-theme=dark]_&]:bg-[#131B2D] [:root[data-theme=dark]_&]:border-gray-800"
                    >
                      <button
                        onClick={() => toggleItem(item.id)}
                        className="w-full flex items-center justify-between px-6 py-4 text-left focus:outline-none transition-colors
                          hover:bg-gray-50 [:root[data-theme=dark]_&]:hover:bg-white/5"
                        aria-expanded={isOpen}
                      >
                        <span className="text-sm md:text-base pr-4 font-medium text-gray-900 [:root[data-theme=dark]_&]:text-gray-100">
                          Q. {t(item.qKey)}
                        </span>
                        <ChevronDownIcon
                          className={`h-4 w-4 transition-transform duration-200 shrink-0 
                            text-gray-400 [:root[data-theme=dark]_&]:text-gray-500
                            ${isOpen ? "rotate-180" : ""}`}
                        />
                      </button>

                      {/* 답변 영역 */}
                      <div
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${
                          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                        }`}
                      >
                        {/* [수정] 답변 텍스트 및 경계선 색상 대응 */}
                        <div
                          className="px-6 pb-6 pt-2 text-sm leading-relaxed border-t
                          text-gray-600 border-gray-100
                          [:root[data-theme=dark]_&]:text-gray-400 [:root[data-theme=dark]_&]:border-gray-800/50"
                        >
                          {t(item.aKey)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================
        3. 하단 문의하기 박스
        ========================================================================
      */}
      <section className="max-w-4xl mx-auto px-4 mt-16">
        {/* [수정] 박스 배경/테두리 색상 대응 */}
        <div
          className="rounded-xl p-6 md:p-8 border
          bg-white border-gray-200
          [:root[data-theme=dark]_&]:bg-[#131B2D]/50 [:root[data-theme=dark]_&]:border-gray-800"
        >
          <h3 className="text-[#06b6d4] font-bold mb-2">
            {t("contact.title")}
          </h3>
          <p className="text-gray-500 text-sm mb-6 [:root[data-theme=dark]_&]:text-gray-400">
            {t("contact.description")}
          </p>

          <div className="space-y-2 text-sm">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <span className="text-[#06b6d4] font-medium min-w-[60px]">
                {t("contact.emailLabel")}
              </span>
              <span className="text-gray-700 [:root[data-theme=dark]_&]:text-gray-300">
                globx@gmail.com
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <span className="text-[#06b6d4] font-medium min-w-[60px]">
                {t("contact.phoneLabel")}
              </span>
              <span className="text-gray-700 [:root[data-theme=dark]_&]:text-gray-300">
                070-1111-1111
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <span className="text-[#06b6d4] font-medium min-w-[60px]">
                {t("contact.hoursLabel")}
              </span>
              <span className="text-gray-700 [:root[data-theme=dark]_&]:text-gray-300">
                {t("contact.hoursValue")}
              </span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
