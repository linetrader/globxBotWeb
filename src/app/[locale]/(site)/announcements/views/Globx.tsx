"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations, useFormatter } from "next-intl";
import {
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

// ===== Types =====
interface SitePostListItem {
  id: string;
  title: string;
  publishedAt: string; // ISO
}

interface SitePostDetail {
  id: string;
  title: string;
  bodyHtml: string;
  publishedAt: string | null; // ISO or null
  createdAt: string; // ISO
}

type SiteListResult =
  | { ok: true; data: SitePostListItem[] }
  | { ok: false; error: string };

type SiteDetailResult =
  | { ok: true; data: SitePostDetail }
  | { ok: false; error: string };

// ===== Util =====
async function jsonFetch<T>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(input, init);
  const ct = res.headers.get("content-type") ?? "";
  if (!ct.includes("application/json")) {
    const text = await res.text();
    throw new Error(
      `HTTP ${res.status} ${res.statusText} — non-JSON: ${text.slice(0, 300)}`
    );
  }
  const data = (await res.json()) as unknown;
  return data as T;
}

export function GlobxView() {
  // ✅ [설정] Globx 네임스페이스 사용
  const t = useTranslations("announcement.Globx");
  const f = useFormatter();

  // ===== State =====
  const [list, setList] = useState<SitePostListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 상세 내용 State
  const [detail, setDetail] = useState<SitePostDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);

  // UI State
  const [searchTerm, setSearchTerm] = useState("");
  const [openItemId, setOpenItemId] = useState<string | null>(null);

  // ===== Data Fetching =====
  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const raw = await jsonFetch<SiteListResult>("/api/announcement", {
        cache: "no-store",
      });
      if (raw.ok) setList(raw.data);
      else throw new Error(raw.error);
    } catch (e) {
      setError(e instanceof Error ? e.message : "unknown error");
      setList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // 상세 내용 로드
  const loadDetail = useCallback(async (id: string) => {
    setLoadingDetail(true);
    setDetail(null);
    try {
      const raw = await jsonFetch<SiteDetailResult>(
        `/api/announcement?id=${encodeURIComponent(id)}`,
        { cache: "no-store" }
      );
      if (raw.ok) setDetail(raw.data);
      else throw new Error(raw.error);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  // ===== Logic =====
  const ordered = useMemo(
    () =>
      [...list].sort((a, b) => {
        return (b.publishedAt || "").localeCompare(a.publishedAt || "");
      }),
    [list]
  );

  const filteredList = useMemo(() => {
    if (!searchTerm.trim()) return ordered;
    const lowerTerm = searchTerm.toLowerCase();
    return ordered.filter((item) =>
      item.title.toLowerCase().includes(lowerTerm)
    );
  }, [ordered, searchTerm]);

  const handleToggle = (id: string) => {
    if (openItemId === id) {
      setOpenItemId(null);
    } else {
      setOpenItemId(id);
      loadDetail(id);
    }
  };

  const formatDateTime = (iso: string): string =>
    f.dateTime(new Date(iso), {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

  return (
    <main className="min-h-screen pb-20 bg-gray-50 text-gray-900 transition-colors duration-300 [:root[data-theme=dark]_&]:bg-[#0B1222] [:root[data-theme=dark]_&]:text-gray-100">
      {/* 1. 상단 헤더 & 검색 영역 */}
      <section className="pt-20 pb-12 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-gray-900 [:root[data-theme=dark]_&]:text-white">
            {t("header.title")}
          </h1>
          {error ? (
            <p className="text-red-500 mb-8 font-medium">
              {t("messages.errorPrefix")} {error}
            </p>
          ) : (
            <p className="text-gray-500 mb-8 [:root[data-theme=dark]_&]:text-gray-400">
              {t("header.subtitle")}
            </p>
          )}

          {/* 검색 바 */}
          <div className="relative max-w-2xl mx-auto flex items-center w-full">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder={t("actions.searchPlaceholder")}
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
              onClick={refresh}
              disabled={loading}
              className="h-14 bg-[#06b6d4] hover:bg-[#0891b2] text-white font-medium px-6 rounded-r-lg transition-colors border border-[#06b6d4] 
              shrink-0 whitespace-nowrap flex items-center gap-2"
            >
              {loading ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                <ArrowPathIcon className="h-5 w-5" />
              )}
              <span className="hidden sm:inline">{t("actions.refresh")}</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. 공지사항 메인 콘텐츠 영역 */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">{t("list.title")}</h2>
            <p className="text-gray-500 text-sm [:root[data-theme=dark]_&]:text-gray-400">
              {t("list.totalPosts", { count: filteredList.length })}
            </p>
          </div>
        </div>

        {/* 결과 없음 */}
        {!loading && filteredList.length === 0 && (
          <div className="text-center py-16 border border-dashed border-gray-300 rounded-xl [:root[data-theme=dark]_&]:border-gray-700">
            <p className="text-gray-500 [:root[data-theme=dark]_&]:text-gray-400">
              {t("messages.emptyList")}
            </p>
          </div>
        )}

        {/* 리스트 반복 */}
        <div className="space-y-4">
          {filteredList.map((item) => {
            const isOpen = openItemId === item.id;
            return (
              <div
                key={item.id}
                className={`rounded-lg overflow-hidden border transition-all duration-200
                  ${
                    isOpen
                      ? "border-[#06b6d4] shadow-md shadow-cyan-900/10"
                      : "border-gray-200 [:root[data-theme=dark]_&]:border-gray-800"
                  }
                  bg-white [:root[data-theme=dark]_&]:bg-[#131B2D]`}
              >
                <button
                  onClick={() => handleToggle(item.id)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left focus:outline-none transition-colors
                    hover:bg-gray-50 [:root[data-theme=dark]_&]:hover:bg-white/5"
                  aria-expanded={isOpen}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 pr-4 w-full">
                    <span
                      className="shrink-0 text-xs font-medium px-2.5 py-1 rounded-md 
                      bg-gray-100 text-gray-600 
                      [:root[data-theme=dark]_&]:bg-gray-800 [:root[data-theme=dark]_&]:text-gray-400"
                    >
                      {formatDateTime(item.publishedAt)}
                    </span>
                    <span
                      className={`text-base md:text-lg font-medium transition-colors
                      ${
                        isOpen
                          ? "text-[#06b6d4]"
                          : "text-gray-900 [:root[data-theme=dark]_&]:text-gray-100"
                      }`}
                    >
                      {item.title}
                    </span>
                  </div>

                  <ChevronDownIcon
                    className={`h-5 w-5 transition-transform duration-200 shrink-0 
                      ${
                        isOpen
                          ? "rotate-180 text-[#06b6d4]"
                          : "text-gray-400 [:root[data-theme=dark]_&]:text-gray-500"
                      }`}
                  />
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div
                    className="px-6 pb-8 pt-4 border-t
                    border-gray-100 [:root[data-theme=dark]_&]:border-gray-800/50"
                  >
                    {loadingDetail && !detail ? (
                      <div className="flex justify-center py-8">
                        <span className="loading loading-spinner text-primary" />
                      </div>
                    ) : detail && detail.id === item.id ? (
                      <div
                        className="prose max-w-none 
                        text-gray-600 prose-headings:text-gray-900 prose-strong:text-gray-900 prose-a:text-[#06b6d4]
                        [:root[data-theme=dark]_&]:text-gray-300 [:root[data-theme=dark]_&]:prose-headings:text-gray-100 [:root[data-theme=dark]_&]:prose-strong:text-gray-100"
                        dangerouslySetInnerHTML={{
                          __html: detail.bodyHtml ?? "",
                        }}
                      />
                    ) : (
                      <div className="text-center py-4 text-sm opacity-70">
                        {t("messages.contentNotAvailable")}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="h-12" />
    </main>
  );
}
