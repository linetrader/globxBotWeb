// src/app/[locale]/(site)/about/page.tsx (JSON 키에 맞게 수정)

import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import {
  CurrencyDollarIcon,
  ShieldCheckIcon,
  ChevronDownIcon,
  ArrowUpRightIcon,
} from "@heroicons/react/24/outline";

// [수정] Next.js 15에서는 params가 Promise 타입입니다. (유지)
type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;

  // 네임스페이스 'about' 사용
  const t = await getTranslations({ locale, namespace: "about" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default function AboutPage() {
  // 네임스페이스 'about' 사용
  const t = useTranslations("about");

  const faqItems = [0, 1, 2, 3, 4, 5];

  return (
    // 전체 페이지 배경색
    <div className="min-h-screen bg-[#0B1120] text-slate-200">
      {/* =========================================
          1. Hero Section 
      ========================================= */}
      <section className="relative w-full h-[700px] flex items-center overflow-hidden">
        {/* ... 배경 이미지 영역 유지 ... */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/21380.png"
            alt="Hero Background"
            fill
            className="object-cover object-top"
            priority
          />
        </div>

        {/* 컨텐츠 영역 */}
        <div className="container relative z-10 mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center h-full pt-20">
          {/* 왼쪽 텍스트 */}
          <div className="space-y-6 text-center lg:text-left">
            <p className="text-cyan-400 font-medium tracking-wider drop-shadow-md">
              {t("heroTagline")}
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight drop-shadow-lg">
              <span className="bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
                {t("heroTitle")}
              </span>
            </h1>
            {/* 로고 이미지 */}
            <p className="text-xl text-slate-100 flex items-center justify-center lg:justify-start drop-shadow-md">
              <span className="relative w-[150px] h-6 md:h-7">
                <Image
                  src="/logowite.png"
                  alt={t("heroSubtitle")}
                  fill
                  className={`object-contain object-left`}
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

          {/* ... 오른쪽 목업 이미지 영역 유지 ... */}
          <div className="relative h-full hidden lg:block w-full">
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-full max-w-[420px] h-[550px]">
              <Image
                src="/Group 14.png"
                alt="App Interface Mockup"
                fill
                className="object-contain object-center drop-shadow-2xl"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          2. Features Section (자동화 시대의 선두주자)
      ========================================= */}
      <section className="py-24 container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold">
            {/* [수정] JSON 키 사용 */}
            {t("featuresMainTitleStart")}{" "}
            <span className="text-cyan-400">
              {t("featuresMainTitleHighlight")}
            </span>
          </h2>
          <p className="text-slate-400 leading-relaxed">
            {/* [수정] JSON 키 사용 및 <br/> 태그 제거 */}
            {t("featuresMainDescLine1")}
            <br />
            {t("featuresMainDescLine2")}
            <br />
            {t("featuresMainDescLine3")}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Card 1: 강력한 전략 */}
          <div className="bg-[#131B2D] p-8 rounded-2xl border border-slate-800/50 hover:border-cyan-500/30 transition-colors relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            <span className="text-xs font-bold text-cyan-400 tracking-widest mb-4 inline-block">
              TRADING
            </span>
            <ArrowUpRightIcon className="h-12 w-12 text-cyan-500 mb-6" />
            <h3 className="text-xl font-bold mb-3">{t("feature1Title")}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              {t("feature1Desc")}
            </p>
          </div>

          {/* Card 2: 무제한의 수익률 */}
          <div className="bg-[#131B2D] p-8 rounded-2xl border border-slate-800/50 hover:border-cyan-500/30 transition-colors relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            <span className="text-xs font-bold text-cyan-400 tracking-widest mb-4 inline-block">
              TRADING
            </span>
            <CurrencyDollarIcon className="h-12 w-12 text-cyan-500 mb-6" />
            <h3 className="text-xl font-bold mb-3">{t("feature2Title")}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              {t("feature2Desc")}
            </p>
          </div>

          {/* Card 3: 안전한 보안성 특화 */}
          <div className="bg-[#131B2D] p-8 rounded-2xl border border-slate-800/50 hover:border-cyan-500/30 transition-colors relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            <span className="text-xs font-bold text-cyan-400 tracking-widest mb-4 inline-block">
              SECURITY
            </span>
            <ShieldCheckIcon className="h-12 w-12 text-cyan-500 mb-6" />
            <h3 className="text-xl font-bold mb-3">{t("feature3Title")}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              {t("feature3Desc")}
            </p>
          </div>
        </div>
      </section>

      {/* =========================================
          3. First Time Section (GlobX 처음이라면?)
      ========================================= */}
      <section className="py-24 container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-cyan-500 text-sm font-bold tracking-wider uppercase mb-2 inline-block">
            {t("firstTimeTag")} {/* [수정] GlobX 태그 사용 */}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold">
            {/* [수정] JSON 키 사용 */}
            {t("firstTimeTitleStart")}
            <span className="text-cyan-400">
              {t("firstTimeTitleHighlight")}
            </span>
            ?
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Card 1: 24시간 AI (로봇 1 이미지) */}
          <div className="bg-[#131B2D] rounded-3xl border border-slate-800/50 overflow-hidden flex flex-col-reverse md:flex-row items-center">
            <div className="p-8 md:pr-0 flex-1 space-y-4">
              <span className="text-xs font-bold text-cyan-400 tracking-widest">
                {t("firstTimeTag")} {/* [수정] GlobX 태그 사용 */}
              </span>
              <h3 className="text-2xl font-bold">{t("firstTimeCard1Title")}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
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

          {/* Card 2: 100% 활용 (로봇 2 이미지) */}
          <div className="bg-[#131B2D] rounded-3xl border border-slate-800/50 overflow-hidden flex flex-col-reverse md:flex-row items-center">
            <div className="p-8 md:pr-0 flex-1 space-y-4">
              <span className="text-xs font-bold text-cyan-400 tracking-widest">
                {t("firstTimeTag")} {/* [수정] GlobX 태그 사용 */}
              </span>
              <h3 className="text-2xl font-bold">{t("firstTimeCard2Title")}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
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

      {/* =========================================
          4. Case Study Section
      ========================================= */}
      <section className="py-24 container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Case Study 1: 직장인 (차트 이미지 적용됨) */}
          <div className="bg-[#131B2D] rounded-3xl border border-slate-800/50 overflow-hidden group">
            <div className="p-8 pb-0 space-y-4">
              <span className="text-xs font-bold text-blue-400 tracking-widest">
                CASE STUDY
              </span>
              <h3 className="text-2xl font-bold">{t("case1Title")}</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                {t("case1Desc")}
              </p>
              <div>
                <span className="inline-block bg-cyan-500/20 text-cyan-300 text-sm font-bold px-4 py-2 rounded-lg">
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

          {/* Case Study 2: 초보 투자자 (smile.png 적용됨) */}
          <div className="bg-[#131B2D] rounded-3xl border border-slate-800/50 overflow-hidden group">
            <div className="p-8 pb-0 space-y-4">
              <span className="text-xs font-bold text-blue-400 tracking-widest">
                CASE STUDY
              </span>
              <h3 className="text-2xl font-bold">{t("case2Title")}</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                {t("case2Desc")}
              </p>
              <div>
                <span className="inline-block bg-cyan-500/20 text-cyan-300 text-sm font-bold px-4 py-2 rounded-lg">
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

      {/* =========================================
          5. FAQ Section (자주 묻는 질문)
      ========================================= */}
      <section className="py-24 container mx-auto px-4 max-w-4xl text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          {t("faqTitleStart")}{" "}
          <span className="text-cyan-400">{t("faqTitleHighlight")}</span>
        </h2>
        <p className="text-slate-400 mb-12">{t("faqSubtitle")}</p>

        <div className="space-y-4 text-left">
          {faqItems.map((item, index) => (
            <details
              key={index}
              className="group bg-[#131B2D] rounded-xl border border-slate-800/50 open:border-cyan-500/50 transition-colors"
            >
              <summary className="flex justify-between items-center p-6 cursor-pointer list-none">
                <h3 className="font-medium text-lg pr-4">
                  {t(`faqQ${index + 1}`)}
                </h3>
                <ChevronDownIcon className="h-5 w-5 text-slate-400 transition-transform duration-300 group-open:rotate-180 group-open:text-cyan-500" />
              </summary>
              <div className="px-6 pb-6 text-slate-400 leading-relaxed border-t border-slate-800/50 pt-4">
                <p>{t(`faqA${index + 1}`)}</p>
              </div>
            </details>
          ))}
        </div>

        <div className="mt-16 space-y-6">
          <p className="text-slate-400">{t("faqFooterText")}</p>
          <button className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-10 rounded-full transition-colors shadow-lg shadow-cyan-500/20">
            {t("faqFooterButton")}
          </button>
        </div>
      </section>
    </div>
  );
}
