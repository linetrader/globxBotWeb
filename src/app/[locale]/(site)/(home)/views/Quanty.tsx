"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import {
  CurrencyDollarIcon,
  ShieldCheckIcon,
  ChevronDownIcon,
  ArrowUpRightIcon,
} from "@heroicons/react/24/outline";

const FAQ_INDEXES = [1, 2, 3, 4, 5, 6] as const;

export function QuantyView() {
  const t = useTranslations("home.Quanty");

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 transition-colors duration-300 [:root[data-theme=dark]_&]:bg-[#0B1120] [:root[data-theme=dark]_&]:text-slate-200">
      {/* 1. Hero Section */}
      <section className="relative w-full h-[700px] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/Quantyback.png"
            alt="Hero Background"
            fill
            className="object-cover object-top"
            priority
          />
        </div>

        <div className="container relative z-10 mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center h-full pt-20">
          <div className="space-y-6 text-center lg:text-left">
            <p className="text-cyan-400 font-medium tracking-wider drop-shadow-md">
              {t("heroTagline")}
            </p>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight drop-shadow-lg">
              <span className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent [:root[data-theme=dark]_&]:from-white [:root[data-theme=dark]_&]:to-slate-200">
                {t("heroTitle")}
              </span>
            </h1>

            <p className="text-xl text-slate-100 flex items-center justify-center lg:justify-start drop-shadow-md">
              {/* [수정됨] 로고 크기 조정 
                  기존: w-[150px] h-6 md:h-7
                  변경: w-[220px] h-12 md:h-16 (로고 비율에 따라 너비/높이 조절 필요)
              */}
              <span className="relative w-[220px] h-12 md:h-16">
                <Image
                  src="/Quantylogo.png"
                  alt={t("heroSubtitle")}
                  fill
                  className="object-contain object-left"
                  unoptimized
                />
              </span>
            </p>

            <div className="pt-8">
              <button className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-8 rounded-none transition-colors shadow-lg shadow-cyan-500/20">
                {t("heroButton")}
              </button>
            </div>
          </div>

          {/* Group 14.png 이미지 영역 제거됨 */}
        </div>
      </section>

      {/* 2. Features Section */}
      <section className="py-24 container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold">
            {t("featuresMainTitleStart")}{" "}
            <span className="text-cyan-400">
              {t("featuresMainTitleHighlight")}
            </span>
          </h2>

          <p className="leading-relaxed text-gray-600 [:root[data-theme=dark]_&]:text-slate-400">
            {t("featuresMainDescLine1")}
            <br />
            {t("featuresMainDescLine2")}
            <br />
            {t("featuresMainDescLine3")}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div
            className="p-8 rounded-2xl transition-colors relative overflow-hidden group border
            bg-white border-gray-200 hover:border-cyan-500/30
            [:root[data-theme=dark]_&]:bg-[#131B2D] [:root[data-theme=dark]_&]:border-slate-800/50"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            <span className="text-xs font-bold text-cyan-400 tracking-widest mb-4 inline-block">
              TRADING
            </span>
            <ArrowUpRightIcon className="h-12 w-12 text-cyan-500 mb-6" />
            <h3 className="text-xl font-bold mb-3">{t("feature1Title")}</h3>
            <p className="text-sm leading-relaxed text-gray-600 [:root[data-theme=dark]_&]:text-slate-400">
              {t("feature1Desc")}
            </p>
          </div>

          {/* Card 2 */}
          <div
            className="p-8 rounded-2xl transition-colors relative overflow-hidden group border
            bg-white border-gray-200 hover:border-cyan-500/30
            [:root[data-theme=dark]_&]:bg-[#131B2D] [:root[data-theme=dark]_&]:border-slate-800/50"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            <span className="text-xs font-bold text-cyan-400 tracking-widest mb-4 inline-block">
              TRADING Quanty
            </span>
            <CurrencyDollarIcon className="h-12 w-12 text-cyan-500 mb-6" />
            <h3 className="text-xl font-bold mb-3">{t("feature2Title")}</h3>
            <p className="text-sm leading-relaxed text-gray-600 [:root[data-theme=dark]_&]:text-slate-400">
              {t("feature2Desc")}
            </p>
          </div>

          {/* Card 3 */}
          <div
            className="p-8 rounded-2xl transition-colors relative overflow-hidden group border
            bg-white border-gray-200 hover:border-cyan-500/30
            [:root[data-theme=dark]_&]:bg-[#131B2D] [:root[data-theme=dark]_&]:border-slate-800/50"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            <span className="text-xs font-bold text-cyan-400 tracking-widest mb-4 inline-block">
              SECURITY
            </span>
            <ShieldCheckIcon className="h-12 w-12 text-cyan-500 mb-6" />
            <h3 className="text-xl font-bold mb-3">{t("feature3Title")}</h3>
            <p className="text-sm leading-relaxed text-gray-600 [:root[data-theme=dark]_&]:text-slate-400">
              {t("feature3Desc")}
            </p>
          </div>
        </div>
      </section>

      {/* 3. First Time Section */}
      <section className="py-24 container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-cyan-500 text-sm font-bold tracking-wider uppercase mb-2 inline-block">
            {t("firstTimeTag")}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold">
            {t("firstTimeTitleStart")}
            <span className="text-cyan-400">
              {t("firstTimeTitleHighlight")}
            </span>
            ?
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Card 1 */}
          <div
            className="rounded-3xl overflow-hidden flex flex-col-reverse md:flex-row items-center border
            bg-white border-gray-200
            [:root[data-theme=dark]_&]:bg-[#131B2D] [:root[data-theme=dark]_&]:border-slate-800/50"
          >
            <div className="p-8 md:pr-0 flex-1 space-y-4">
              <span className="text-xs font-bold text-cyan-400 tracking-widest">
                {t("firstTimeTag")}
              </span>
              <h3 className="text-2xl font-bold">{t("firstTimeCard1Title")}</h3>
              <p className="text-sm leading-relaxed text-gray-600 [:root[data-theme=dark]_&]:text-slate-400">
                {t("firstTimeCard1Desc")}
              </p>
            </div>
            <div className="flex-1 p-8 flex justify-center items-center">
              <div className="relative w-[120px] h-[120px]">
                <Image
                  src="/robot 1.png"
                  alt="AI Robot Illustration"
                  fill
                  className="object-contain drop-shadow-xl"
                />
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div
            className="rounded-3xl overflow-hidden flex flex-col-reverse md:flex-row items-center border
            bg-white border-gray-200
            [:root[data-theme=dark]_&]:bg-[#131B2D] [:root[data-theme=dark]_&]:border-slate-800/50"
          >
            <div className="p-8 md:pr-0 flex-1 space-y-4">
              <span className="text-xs font-bold text-cyan-400 tracking-widest">
                {t("firstTimeTag")}
              </span>
              <h3 className="text-2xl font-bold">{t("firstTimeCard2Title")}</h3>
              <p className="text-sm leading-relaxed text-gray-600 [:root[data-theme=dark]_&]:text-slate-400">
                {t("firstTimeCard2Desc")}
              </p>
            </div>
            <div className="flex-1 p-8 flex justify-center items-center">
              <div className="relative w-[120px] h-[120px]">
                <Image
                  src="/robot 2.png"
                  alt="Laptop Chart Illustration"
                  fill
                  className="object-contain drop-shadow-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Case Study Section */}
      <section className="py-24 container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Case 1 */}
          <div
            className="rounded-3xl overflow-hidden group border
            bg-white border-gray-200
            [:root[data-theme=dark]_&]:bg-[#131B2D] [:root[data-theme=dark]_&]:border-slate-800/50"
          >
            <div className="p-8 pb-0 space-y-4">
              <span className="text-xs font-bold text-blue-400 tracking-widest">
                CASE STUDY
              </span>
              <h3 className="text-2xl font-bold">{t("case1Title")}</h3>
              <p className="text-sm leading-relaxed mb-6 text-gray-600 [:root[data-theme=dark]_&]:text-slate-400">
                {t("case1Desc")}
              </p>
              <div>
                <span className="inline-block bg-cyan-500/20 text-cyan-600 text-sm font-bold px-4 py-2 rounded-lg [:root[data-theme=dark]_&]:text-cyan-300">
                  {t("case1Stat")}
                </span>
              </div>
            </div>
            <div className="mt-8 relative h-48 md:h-60 w-full">
              <Image
                src="/chat.png"
                alt="Trading Chart Analysis"
                fill
                className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          </div>

          {/* Case 2 */}
          <div
            className="rounded-3xl overflow-hidden group border
            bg-white border-gray-200
            [:root[data-theme=dark]_&]:bg-[#131B2D] [:root[data-theme=dark]_&]:border-slate-800/50"
          >
            <div className="p-8 pb-0 space-y-4">
              <span className="text-xs font-bold text-blue-400 tracking-widest">
                CASE STUDY
              </span>
              <h3 className="text-2xl font-bold">{t("case2Title")}</h3>
              <p className="text-sm leading-relaxed mb-6 text-gray-600 [:root[data-theme=dark]_&]:text-slate-400">
                {t("case2Desc")}
              </p>
              <div>
                <span className="inline-block bg-cyan-500/20 text-cyan-600 text-sm font-bold px-4 py-2 rounded-lg [:root[data-theme=dark]_&]:text-cyan-300">
                  {t("case2Stat")}
                </span>
              </div>
            </div>
            <div className="mt-8 relative h-48 md:h-60 w-full">
              <Image
                src="/smile.png"
                alt="Happy Investor"
                fill
                className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 5. FAQ Section */}
      <section className="py-24 container mx-auto px-4 max-w-4xl text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          {t("faqTitleStart")}{" "}
          <span className="text-cyan-400">{t("faqTitleHighlight")}</span>
        </h2>
        <p className="mb-12 text-gray-600 [:root[data-theme=dark]_&]:text-slate-400">
          {t("faqSubtitle")}
        </p>

        <div className="space-y-4 text-left">
          {FAQ_INDEXES.map((n) => (
            <details
              key={n}
              className="group rounded-xl border transition-colors
                bg-white border-gray-200 open:border-cyan-500/50
                [:root[data-theme=dark]_&]:bg-[#131B2D] [:root[data-theme=dark]_&]:border-slate-800/50"
            >
              <summary className="flex justify-between items-center p-6 cursor-pointer list-none">
                <h3 className="font-medium text-lg pr-4">{t(`faqQ${n}`)}</h3>
                <ChevronDownIcon className="h-5 w-5 text-gray-400 transition-transform duration-300 group-open:rotate-180 group-open:text-cyan-500 [:root[data-theme=dark]_&]:text-slate-400" />
              </summary>
              <div
                className="px-6 pb-6 leading-relaxed border-t pt-4
                text-gray-600 border-gray-100
                [:root[data-theme=dark]_&]:text-slate-400 [:root[data-theme=dark]_&]:border-slate-800/50"
              >
                <p>{t(`faqA${n}`)}</p>
              </div>
            </details>
          ))}
        </div>

        <div className="mt-16 space-y-6">
          <p className="text-gray-600 [:root[data-theme=dark]_&]:text-slate-400">
            {t("faqFooterText")}
          </p>
          <Link
            href="/help"
            className="inline-block bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-10 rounded-full transition-colors shadow-lg shadow-cyan-500/20"
          >
            {t("faqFooterButton")}
          </Link>
        </div>
      </section>
    </div>
  );
}
