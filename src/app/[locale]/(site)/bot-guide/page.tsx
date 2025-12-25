"use client";

import { useTranslations } from "next-intl";
import {
  RocketLaunchIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  PlayCircleIcon,
} from "@heroicons/react/24/outline";

export default function BotGuidePage() {
  // 'botGuide' 네임스페이스 사용
  const t = useTranslations("bot-guide");

  const steps = [
    {
      title: t("steps.step1.title"),
      desc: t("steps.step1.desc"),
      icon: <Cog6ToothIcon className="w-8 h-8 text-[#06b6d4]" />,
    },
    {
      title: t("steps.step2.title"),
      desc: t("steps.step2.desc"),
      icon: <ChartBarIcon className="w-8 h-8 text-[#06b6d4]" />,
    },
    {
      title: t("steps.step3.title"),
      desc: t("steps.step3.desc"),
      icon: <PlayCircleIcon className="w-8 h-8 text-[#06b6d4]" />,
    },
  ];

  return (
    <div className="min-h-screen py-16 px-4 transition-colors duration-300 bg-gray-50 text-gray-900 [:root[data-theme=dark]_&]:bg-[#0B1222] [:root[data-theme=dark]_&]:text-gray-100">
      <div className="max-w-5xl mx-auto">
        {/* 헤더 섹션 */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-[#06b6d4]/10 mb-4">
            <RocketLaunchIcon className="w-10 h-10 text-[#06b6d4]" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">
            {t("header.title")}
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto [:root[data-theme=dark]_&]:text-gray-400">
            {t("header.subtitle")}
          </p>
        </div>

        {/* 스텝 카드 섹션 */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {steps.map((step, index) => (
            <div
              key={index}
              className="p-8 rounded-2xl border shadow-lg hover:-translate-y-1 transition-all duration-300
                bg-white border-gray-200
                [:root[data-theme=dark]_&]:bg-[#131B2D] [:root[data-theme=dark]_&]:border-gray-800"
            >
              <div className="mb-4">{step.icon}</div>
              <h3 className="text-xl font-bold mb-3">{step.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed [:root[data-theme=dark]_&]:text-gray-400">
                {step.desc}
              </p>
            </div>
          ))}
        </div>

        {/* 상세 설명 섹션 */}
        <div className="space-y-12">
          {/* API 주의사항 */}
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1 space-y-4">
              <h2 className="text-2xl font-bold text-[#06b6d4]">
                {t("apiCaution.title")}
              </h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700 [:root[data-theme=dark]_&]:text-gray-300">
                <li>{t("apiCaution.items.trade")}</li>
                <li>{t("apiCaution.items.withdraw")}</li>
                <li>{t("apiCaution.items.ip")}</li>
              </ul>
            </div>
            <div
              className="flex-1 h-64 w-full rounded-xl flex items-center justify-center
              bg-gray-200 [:root[data-theme=dark]_&]:bg-[#1e293b]"
            >
              <span className="text-gray-500 font-medium">
                {t("apiCaution.imagePlaceholder")}
              </span>
            </div>
          </div>

          {/* 전략 팁 */}
          <div className="flex flex-col md:flex-row-reverse gap-8 items-center">
            <div className="flex-1 space-y-4">
              <h2 className="text-2xl font-bold text-[#06b6d4]">
                {t("strategyTips.title")}
              </h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700 [:root[data-theme=dark]_&]:text-gray-300">
                <li>{t("strategyTips.items.smallAmount")}</li>
                <li>{t("strategyTips.items.leverage")}</li>
                <li>{t("strategyTips.items.pause")}</li>
              </ul>
            </div>
            <div
              className="flex-1 h-64 w-full rounded-xl flex items-center justify-center
              bg-gray-200 [:root[data-theme=dark]_&]:bg-[#1e293b]"
            >
              <span className="text-gray-500 font-medium">
                {t("strategyTips.imagePlaceholder")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
