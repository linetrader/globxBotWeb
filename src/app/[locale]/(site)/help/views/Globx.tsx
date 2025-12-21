"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  MagnifyingGlassIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";

type FaqItem = {
  id: string;
  qKey: string;
  aKey: string;
};

type FaqCategory = {
  id: string;
  titleKey: string;
  items: FaqItem[];
};

export function GlobxView() {
  const t = useTranslations("help");
  const brandKey = "GlobX";

  const [searchTerm, setSearchTerm] = useState("");
  const [openItemId, setOpenItemId] = useState<string | null>(null);

  const categories: FaqCategory[] = useMemo(
    () => [
      {
        id: "program",
        titleKey: "common.categories.program",
        items: [
          {
            id: "p1",
            qKey: `${brandKey}.qna.program_q1`,
            aKey: `${brandKey}.qna.program_a1`,
          },
          {
            id: "p2",
            qKey: `${brandKey}.qna.program_q2`,
            aKey: `${brandKey}.qna.program_a2`,
          },
          {
            id: "p3",
            qKey: `${brandKey}.qna.program_q3`,
            aKey: `${brandKey}.qna.program_a3`,
          },
          {
            id: "p4",
            qKey: `${brandKey}.qna.program_q4`,
            aKey: `${brandKey}.qna.program_a4`,
          },
        ],
      },
      {
        id: "account",
        titleKey: "common.categories.account",
        items: [
          {
            id: "a1",
            qKey: `${brandKey}.qna.account_q1`,
            aKey: `${brandKey}.qna.account_a1`,
          },
          {
            id: "a2",
            qKey: `${brandKey}.qna.account_q2`,
            aKey: `${brandKey}.qna.account_a2`,
          },
        ],
      },
      {
        id: "trading",
        titleKey: "common.categories.trading",
        items: [
          {
            id: "t1",
            qKey: `${brandKey}.qna.trading_q1`,
            aKey: `${brandKey}.qna.trading_a1`,
          },
          {
            id: "t2",
            qKey: `${brandKey}.qna.trading_q2`,
            aKey: `${brandKey}.qna.trading_a2`,
          },
          {
            id: "t3",
            qKey: `${brandKey}.qna.trading_q3`,
            aKey: `${brandKey}.qna.trading_a3`,
          },
          {
            id: "t4",
            qKey: `${brandKey}.qna.trading_q4`,
            aKey: `${brandKey}.qna.trading_a4`,
          },
        ],
      },
      {
        id: "funds",
        titleKey: "common.categories.funds",
        items: [
          {
            id: "f1",
            qKey: `${brandKey}.qna.funds_q1`,
            aKey: `${brandKey}.qna.funds_a1`,
          },
          {
            id: "f2",
            qKey: `${brandKey}.qna.funds_q2`,
            aKey: `${brandKey}.qna.funds_a2`,
          },
          {
            id: "f3",
            qKey: `${brandKey}.qna.funds_q3`,
            aKey: `${brandKey}.qna.funds_a3`,
          },
        ],
      },
      {
        id: "data",
        titleKey: "common.categories.data",
        items: [
          {
            id: "d1",
            qKey: `${brandKey}.qna.data_q1`,
            aKey: `${brandKey}.qna.data_a1`,
          },
        ],
      },
    ],
    [brandKey]
  );

  const toggleItem = (id: string) => {
    setOpenItemId((prev) => (prev === id ? null : id));
  };

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
    <main className="min-h-screen pb-20 bg-gray-50 text-gray-900 transition-colors duration-300 [:root[data-theme=dark]_&]:bg-[#0B1222] [:root[data-theme=dark]_&]:text-gray-100">
      {/* 1. 상단 헤더 & 검색 */}
      <section className="pt-20 pb-12 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-gray-900 [:root[data-theme=dark]_&]:text-white">
            {t(`${brandKey}.header.title`)}
          </h1>
          <p className="text-gray-500 mb-8 [:root[data-theme=dark]_&]:text-gray-400">
            {t(`${brandKey}.header.subtitle`)}
          </p>

          <div className="relative max-w-2xl mx-auto flex items-center w-full">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder={t("common.searchPlaceholder")}
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
            <button
              className="h-14 bg-[#06b6d4] hover:bg-[#0891b2] text-white font-medium px-8 rounded-r-lg transition-colors border border-[#06b6d4] 
              shrink-0 whitespace-nowrap"
            >
              {t("common.searchButton")}
            </button>
          </div>
        </div>
      </section>

      {/* 2. FAQ 목록 */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          {/* JSON에 없는 키라 common으로 대체하거나 하드코딩 필요할 수 있음. 여기선 JSON 구조상 없는 키를 제거하고 직접 렌더링 */}
          <h2 className="text-2xl font-bold mb-2">FAQ</h2>
        </div>

        {filteredCategories.length === 0 && (
          <div className="text-center py-12 text-gray-500 border border-gray-200 rounded-lg [:root[data-theme=dark]_&]:border-gray-800">
            검색 결과가 없습니다.
          </div>
        )}

        <div className="space-y-10">
          {filteredCategories.map((cat) => (
            <div key={cat.id}>
              <h3 className="font-medium mb-3 pl-1 text-sm md:text-base text-gray-700 [:root[data-theme=dark]_&]:text-gray-300">
                {t(cat.titleKey)}
              </h3>
              <div className="space-y-3">
                {cat.items.map((item) => {
                  const isOpen = openItemId === item.id;
                  return (
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
                      <div
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${
                          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                        }`}
                      >
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

      {/* 3. 하단 문의하기 */}
      <section className="max-w-4xl mx-auto px-4 mt-16">
        <div
          className="rounded-xl p-6 md:p-8 border
          bg-white border-gray-200
          [:root[data-theme=dark]_&]:bg-[#131B2D]/50 [:root[data-theme=dark]_&]:border-gray-800"
        >
          <h3 className="text-[#06b6d4] font-bold mb-2">
            {t("common.contact.title")}
          </h3>
          <p className="text-gray-500 text-sm mb-6 [:root[data-theme=dark]_&]:text-gray-400">
            {t("common.contact.description")}
          </p>

          <div className="space-y-2 text-sm">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <span className="text-[#06b6d4] font-medium min-w-[60px]">
                {t("common.contact.emailLabel")}
              </span>
              <span className="text-gray-700 [:root[data-theme=dark]_&]:text-gray-300">
                {t(`${brandKey}.contactInfo.email`)}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <span className="text-[#06b6d4] font-medium min-w-[60px]">
                {t("common.contact.phoneLabel")}
              </span>
              <span className="text-gray-700 [:root[data-theme=dark]_&]:text-gray-300">
                {t(`${brandKey}.contactInfo.phone`)}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <span className="text-[#06b6d4] font-medium min-w-[60px]">
                {t("common.contact.hoursLabel")}
              </span>
              <span className="text-gray-700 [:root[data-theme=dark]_&]:text-gray-300">
                {t("common.contact.hoursValue")}
              </span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
