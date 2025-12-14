// src/app/[locale]/(site)/cases/page.tsx
"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

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
    <main className="mx-auto max-w-screen-lg px-4 py-6 text-base-content">
      <div className="mb-6 flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="mt-1 text-sm opacity-70">{t("subtitle")}</p>
        </div>
        <Link href="/" className="btn btn-ghost btn-sm">
          {t("actions.home")}
        </Link>
      </div>

      {/* 필터 */}
      <section className="mb-6">
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="card-title">{t("filters.title")}</h2>
              <div className="join">
                {tags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className={`btn btn-sm join-item ${
                      active === tag ? "btn-primary" : "btn-ghost"
                    }`}
                    onClick={() => setActive(tag)}
                  >
                    {t(`tags.${tag}`)}
                  </button>
                ))}
              </div>
            </div>
            <p className="mt-2 text-xs opacity-60">{t("filters.hint")}</p>
          </div>
        </div>
      </section>

      {/* 카드 리스트 */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {filtered.map((it) => (
          <article key={it.id} className="card bg-base-100 shadow">
            <div className="card-body">
              <div className="flex flex-wrap items-center gap-2">
                <span className="badge badge-outline">{t(it.tagKey)}</span>
                <span className="badge">{t("badge.sample")}</span>
              </div>

              <h3 className="mt-2 text-lg font-bold">{t(it.titleKey)}</h3>
              <p className="mt-2 text-sm opacity-80 leading-relaxed">
                {t(it.descKey)}
              </p>

              <div className="mt-4 rounded-lg border border-base-300 bg-base-200/30 p-3">
                <div className="text-xs opacity-70">{t("statLabel")}</div>
                <div className="text-sm font-semibold">{t(it.statKey)}</div>
              </div>

              <div className="card-actions justify-end mt-3">
                <button className="btn btn-primary btn-sm" type="button">
                  {t("actions.readMore")}
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="mt-8">
        <div className="alert">
          <span>{t("footer.notice")}</span>
        </div>
      </section>
    </main>
  );
}
