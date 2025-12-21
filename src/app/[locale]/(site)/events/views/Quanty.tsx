"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useTranslations, useFormatter } from "next-intl";
import {
  CalendarDaysIcon,
  XMarkIcon,
  ArrowTopRightOnSquareIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

// ===== Types (Local) =====
interface SiteEventListItem {
  id: string;
  title: string;
  publishedAt: string;
  eventStartAt: string | null;
  eventEndAt: string | null;
  bannerUrl: string | null;
}

interface SiteEventDetail {
  id: string;
  title: string;
  bodyHtml: string;
  publishedAt: string | null;
  createdAt: string;
  eventStartAt: string | null;
  eventEndAt: string | null;
  bannerUrl: string | null;
  ctaLinkUrl: string | null;
}

type SiteListResult =
  | { ok: true; data: SiteEventListItem[] }
  | { ok: false; error: string };

type SiteDetailResult =
  | { ok: true; data: SiteEventDetail }
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
  return (await res.json()) as T;
}

export function QuantyView() {
  const t = useTranslations("event"); // root namespace
  const f = useFormatter();
  const brandKey = "Quanty"; // JSON Key

  // State
  const [list, setList] = useState<SiteEventListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [detail, setDetail] = useState<SiteEventDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Formatter
  const formatDate = (iso: string): string =>
    f.dateTime(new Date(iso), {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

  const formatRange = (
    startIso: string | null,
    endIso: string | null
  ): string => {
    if (!startIso && !endIso) return "-";
    if (startIso && !endIso) return `${formatDate(startIso)} ~`;
    if (!startIso && endIso) return `~ ${formatDate(endIso)}`;
    if (startIso && endIso)
      return `${formatDate(startIso)} ~ ${formatDate(endIso)}`;
    return "-";
  };

  const getEventStatus = (startIso: string | null, endIso: string | null) => {
    const now = new Date();
    if (endIso && new Date(endIso) < now) return "ended";
    if (startIso && new Date(startIso) > now) return "upcoming";
    return "ongoing";
  };

  // Logic
  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const raw = await jsonFetch<SiteListResult>("/api/events", {
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

  const loadDetail = useCallback(async (id: string) => {
    setLoadingDetail(true);
    setIsModalOpen(true);
    try {
      const raw = await jsonFetch<SiteDetailResult>(
        `/api/events?id=${encodeURIComponent(id)}`,
        { cache: "no-store" }
      );
      if (raw.ok) setDetail(raw.data);
      else throw new Error(raw.error);
    } catch (e) {
      console.error(e);
      setDetail(null);
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setDetail(null);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const ordered = useMemo(() => {
    return [...list].sort((a, b) => {
      const statusA = getEventStatus(a.eventStartAt, a.eventEndAt);
      const statusB = getEventStatus(b.eventStartAt, b.eventEndAt);
      if (statusA === "ongoing" && statusB !== "ongoing") return -1;
      if (statusA !== "ongoing" && statusB === "ongoing") return 1;
      const ak = a.eventStartAt ?? a.publishedAt ?? "";
      const bk = b.eventStartAt ?? b.publishedAt ?? "";
      return bk.localeCompare(ak);
    });
  }, [list]);

  return (
    <main className="min-h-screen pb-20 transition-colors duration-300 bg-gray-50 text-gray-900 [:root[data-theme=dark]_&]:bg-[#0B1222] [:root[data-theme=dark]_&]:text-gray-100">
      {/* 1. 헤더 섹션 (Quanty Indigo 테마) */}
      <section className="pt-20 pb-12 px-4 text-center relative overflow-hidden">
        {/* 배경 데코레이션 - Indigo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-indigo-500/5 blur-[100px] rounded-full -z-10 hidden [:root[data-theme=dark]_&]:block" />

        <div className="max-w-4xl mx-auto relative z-10">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 text-gray-900 [:root[data-theme=dark]_&]:text-white drop-shadow-lg">
            {t(`${brandKey}.header.title`)}
          </h1>
          <p className="text-gray-600 text-lg mb-8 [:root[data-theme=dark]_&]:text-gray-400">
            {t(`${brandKey}.header.subtitle`)}
          </p>

          <button
            onClick={refresh}
            disabled={loading}
            className="btn btn-sm btn-outline gap-2 transition-all
              border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-gray-900
              [:root[data-theme=dark]_&]:border-gray-700 [:root[data-theme=dark]_&]:text-gray-400 
              [:root[data-theme=dark]_&]:hover:border-indigo-500 [:root[data-theme=dark]_&]:hover:text-indigo-500 [:root[data-theme=dark]_&]:hover:bg-transparent"
          >
            <ArrowPathIcon
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            {t("common.actions.refresh")}
          </button>
        </div>
      </section>

      {/* 2. 이벤트 리스트 */}
      <section className="container mx-auto px-4 max-w-7xl">
        {error ? (
          <div className="alert alert-error mb-8 max-w-2xl mx-auto">
            <span>
              {t("common.messages.errorPrefix")} {error}
            </span>
          </div>
        ) : null}

        {!loading && ordered.length === 0 ? (
          <div className="text-center py-20 border border-dashed rounded-2xl bg-white/50 border-gray-300 [:root[data-theme=dark]_&]:bg-[#131B2D]/50 [:root[data-theme=dark]_&]:border-gray-800">
            <p className="text-gray-500 text-lg [:root[data-theme=dark]_&]:text-gray-400">
              {t("common.messages.emptyList")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {ordered.map((item) => {
              const status = getEventStatus(item.eventStartAt, item.eventEndAt);
              return (
                <article
                  key={item.id}
                  onClick={() => loadDetail(item.id)}
                  className="
                    group relative rounded-2xl overflow-hidden border transition-all duration-300 cursor-pointer flex flex-col h-full
                    hover:shadow-xl hover:translate-y-[-2px]
                    bg-white border-gray-200 hover:shadow-gray-200 hover:border-indigo-500/50
                    [:root[data-theme=dark]_&]:bg-[#131B2D] [:root[data-theme=dark]_&]:border-gray-800 
                    [:root[data-theme=dark]_&]:hover:shadow-indigo-900/20 [:root[data-theme=dark]_&]:hover:border-indigo-500/50
                  "
                >
                  {/* 배너 이미지 */}
                  <div className="relative aspect-video w-full overflow-hidden bg-gray-100 [:root[data-theme=dark]_&]:bg-gray-900">
                    {item.bannerUrl ? (
                      <Image
                        src={item.bannerUrl}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        unoptimized
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400 [:root[data-theme=dark]_&]:text-gray-700">
                        <span className="text-4xl font-bold opacity-20">
                          EVENT
                        </span>
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      {status === "ongoing" && (
                        <span className="badge border-none bg-indigo-600 text-white font-bold shadow-lg">
                          {t("common.status.ongoing")}
                        </span>
                      )}
                      {status === "upcoming" && (
                        <span className="badge border-none bg-yellow-500 text-black font-bold shadow-lg">
                          {t("common.status.upcoming")}
                        </span>
                      )}
                      {status === "ended" && (
                        <span className="badge border-none bg-gray-500 text-white font-medium [:root[data-theme=dark]_&]:bg-gray-600 [:root[data-theme=dark]_&]:text-gray-300">
                          {t("common.status.ended")}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 텍스트 내용 */}
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold mb-3 line-clamp-2 transition-colors text-gray-900 group-hover:text-indigo-600 [:root[data-theme=dark]_&]:text-white [:root[data-theme=dark]_&]:group-hover:text-indigo-500">
                      {item.title}
                    </h3>
                    <div className="mt-auto pt-4 border-t flex items-center text-sm gap-2 border-gray-100 text-gray-500 [:root[data-theme=dark]_&]:border-gray-800/50 [:root[data-theme=dark]_&]:text-gray-400">
                      <CalendarDaysIcon className="h-4 w-4" />
                      <span>
                        {formatRange(item.eventStartAt, item.eventEndAt)}
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* 3. 상세 보기 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity [:root[data-theme=dark]_&]:bg-black/80"
            onClick={closeModal}
          />
          <div className="relative w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200 bg-white border border-gray-200 [:root[data-theme=dark]_&]:bg-[#131B2D] [:root[data-theme=dark]_&]:border-gray-700">
            <div className="flex items-center justify-between p-4 border-b bg-gray-50 border-gray-200 [:root[data-theme=dark]_&]:bg-[#0B1222] [:root[data-theme=dark]_&]:border-gray-800">
              <h2 className="text-lg font-bold truncate pr-8 text-gray-900 [:root[data-theme=dark]_&]:text-gray-100">
                {detail?.title || t("common.detail.loading")}
              </h2>
              <button
                onClick={closeModal}
                className="btn btn-ghost btn-sm btn-circle text-gray-500 hover:bg-gray-200 [:root[data-theme=dark]_&]:text-gray-400 [:root[data-theme=dark]_&]:hover:text-white [:root[data-theme=dark]_&]:hover:bg-white/10"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-0 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent [:root[data-theme=dark]_&]:scrollbar-thumb-gray-700">
              {loadingDetail ? (
                <div className="flex items-center justify-center h-64">
                  <span className="loading loading-spinner loading-lg text-indigo-600" />
                </div>
              ) : detail ? (
                <div>
                  {detail.bannerUrl && (
                    <div className="relative w-full aspect-video md:aspect-[21/9] bg-black">
                      <Image
                        src={detail.bannerUrl}
                        alt={detail.title}
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                  )}
                  <div className="p-6 md:p-8 space-y-6">
                    <div className="flex flex-wrap gap-4 text-sm rounded-lg border p-4 bg-gray-50 border-gray-200 text-gray-600 [:root[data-theme=dark]_&]:bg-[#0B1222] [:root[data-theme=dark]_&]:border-gray-800 [:root[data-theme=dark]_&]:text-gray-400">
                      <div className="flex items-center gap-2">
                        <span className="text-indigo-600 font-bold">
                          {t("common.detail.periodLabel")}:
                        </span>
                        <span>
                          {formatRange(detail.eventStartAt, detail.eventEndAt)}
                        </span>
                      </div>
                      <div className="w-px h-4 hidden sm:block bg-gray-300 [:root[data-theme=dark]_&]:bg-gray-700" />
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">
                          {t("common.detail.publishedLabel")}:
                        </span>
                        <span>
                          {detail.publishedAt
                            ? formatDate(detail.publishedAt)
                            : "-"}
                        </span>
                      </div>
                    </div>
                    <div
                      className="prose max-w-none text-gray-600 prose-headings:text-gray-900 prose-strong:text-gray-900 prose-a:text-indigo-600 [:root[data-theme=dark]_&]:prose-invert [:root[data-theme=dark]_&]:text-gray-300"
                      dangerouslySetInnerHTML={{
                        __html: detail.bodyHtml ?? "",
                      }}
                    />
                    {detail.ctaLinkUrl && (
                      <div className="pt-6 border-t border-gray-200 [:root[data-theme=dark]_&]:border-gray-800">
                        <a
                          href={detail.ctaLinkUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-primary w-full md:w-auto gap-2 font-bold text-white bg-indigo-600 border-none hover:bg-indigo-700"
                        >
                          {t("common.detail.ctaButton")}
                          <ArrowTopRightOnSquareIcon className="h-5 w-5" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  {t("common.messages.errorPrefix")}{" "}
                  {t("common.detail.placeholder")}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
