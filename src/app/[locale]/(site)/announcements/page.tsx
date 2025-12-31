// src/app/[locale]/(site)/announcements/page.tsx

import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { locales, type AppLocale } from "@/i18n/routing";
import { GlobxView } from "./views/Globx";
import { QuantyView } from "./views/Quanty";

type Props = {
  params: Promise<{ locale: string }>;
};

function isAppLocale(value: string): value is AppLocale {
  return (locales as readonly string[]).includes(value);
}

type Brand = "globx" | "quanty";

function getBrand(): Brand {
  // 환경변수 BRAND_NAME을 확인하여 브랜드 결정
  const raw = (process.env.NEXT_PUBLIC_BRAND_NAME ?? "").trim().toLowerCase();
  if (raw === "quanty") return "quanty";
  return "globx";
}

export async function generateMetadata({ params }: Props) {
  const resolved = await Promise.resolve(params);
  const locale = resolved.locale;

  const brand = getBrand();

  if (!isAppLocale(locale)) {
    return {
      title:
        brand === "quanty" ? "Announcement - Quanty" : "Announcement - GlobX",
      description: brand === "quanty" ? "Quanty News" : "GlobX News",
    };
  }

  // 1. 브랜드에 따른 JSON 키 결정 (대문자 시작)
  const jsonKey = brand === "quanty" ? "Quanty" : "Globx";

  // 2. announcement.json 파일 내의 해당 브랜드 네임스페이스 로드
  const t = await getTranslations({
    locale,
    namespace: `announcement.${jsonKey}`,
  });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function AnnouncementPage({ params }: Props) {
  const resolved = await Promise.resolve(params);
  const locale = resolved.locale;

  if (!isAppLocale(locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const brand = getBrand();

  // 브랜드에 따라 적절한 컴포넌트 렌더링
  return brand === "quanty" ? <QuantyView /> : <GlobxView />;
}
