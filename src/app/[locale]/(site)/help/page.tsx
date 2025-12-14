// src/app/[locale]/(site)/help/page.tsx
"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

type FaqItem = {
  qKey: string;
  aKey: string;
};

export default function HelpPage() {
  const t = useTranslations("help");

  const faqs: FaqItem[] = useMemo(
    () => [
      { qKey: "faq.q1", aKey: "faq.a1" },
      { qKey: "faq.q2", aKey: "faq.a2" },
      { qKey: "faq.q3", aKey: "faq.a3" },
      { qKey: "faq.q4", aKey: "faq.a4" },
      { qKey: "faq.q5", aKey: "faq.a5" },
    ],
    []
  );

  const [category, setCategory] = useState<"QNA" | "ONE_TO_ONE">("QNA");

  return (
    <main className="mx-auto max-w-screen-md px-4 py-6 text-base-content">
      {/* 헤더 */}
      <div className="mb-6 flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="mt-1 text-sm opacity-70">{t("subtitle")}</p>
        </div>
        <Link href="/" className="btn btn-ghost btn-sm">
          {t("actions.home")}
        </Link>
      </div>

      {/* 안내 카드 */}
      <section className="mb-6">
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="card-title">{t("quick.title")}</h2>
              <div className="join">
                <button
                  className={`btn btn-sm join-item ${
                    category === "QNA" ? "btn-primary" : "btn-ghost"
                  }`}
                  onClick={() => setCategory("QNA")}
                  type="button"
                >
                  {t("quick.tabs.qna")}
                </button>
                <button
                  className={`btn btn-sm join-item ${
                    category === "ONE_TO_ONE" ? "btn-primary" : "btn-ghost"
                  }`}
                  onClick={() => setCategory("ONE_TO_ONE")}
                  type="button"
                >
                  {t("quick.tabs.oneToOne")}
                </button>
              </div>
            </div>

            <div className="mt-3 rounded-lg border border-base-300 bg-base-200/30 p-4">
              {category === "QNA" ? (
                <>
                  <p className="text-sm">{t("quick.qna.desc")}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="badge">{t("quick.qna.badge.public")}</span>
                    <span className="badge badge-outline">
                      {t("quick.qna.badge.searchable")}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm">{t("quick.oneToOne.desc")}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="badge">
                      {t("quick.oneToOne.badge.private")}
                    </span>
                    <span className="badge badge-outline">
                      {t("quick.oneToOne.badge.secure")}
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {/* 실제 연결이 아직 없으니 샘플 버튼 */}
              <button className="btn btn-primary btn-sm" type="button">
                {t("actions.createTicket")}
              </button>
              <button className="btn btn-ghost btn-sm" type="button">
                {t("actions.viewMyTickets")}
              </button>
            </div>

            <p className="mt-3 text-xs opacity-60">{t("notice.sampleOnly")}</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mb-6">
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title">{t("faq.title")}</h2>
            <p className="text-sm opacity-70">{t("faq.subtitle")}</p>

            <div className="mt-4 space-y-3">
              {faqs.map((it) => (
                <details
                  key={it.qKey}
                  className="group rounded-xl border border-base-300 bg-base-100 p-4 open:border-primary/40"
                >
                  <summary className="cursor-pointer list-none">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-medium">{t(it.qKey)}</div>
                      <span className="text-xs opacity-60 group-open:opacity-100">
                        {t("faq.openHint")}
                      </span>
                    </div>
                  </summary>
                  <div className="mt-3 text-sm opacity-80 leading-relaxed">
                    {t(it.aKey)}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 연락처 */}
      <section>
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title">{t("contact.title")}</h2>
            <p className="text-sm opacity-70">{t("contact.subtitle")}</p>

            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-base-300 p-4">
                <div className="text-sm font-medium">
                  {t("contact.email.label")}
                </div>
                <div className="mt-1 text-sm opacity-80">
                  {t("contact.email.value")}
                </div>
              </div>
              <div className="rounded-lg border border-base-300 p-4">
                <div className="text-sm font-medium">
                  {t("contact.hours.label")}
                </div>
                <div className="mt-1 text-sm opacity-80">
                  {t("contact.hours.value")}
                </div>
              </div>
            </div>

            <div className="mt-4">
              <Link href="/announcements" className="link link-primary text-sm">
                {t("contact.linkToAnnouncements")}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
