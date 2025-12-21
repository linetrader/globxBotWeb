// src/app/[locale]/(site)/(home)/page.tsx

import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { locales, type AppLocale } from "@/i18n/routing";
import { GlobxView } from "./views/Globx";
import { QuantyView } from "./views/Quanty";

type Props = {
  params: Promise<{ locale: string }> | { locale: string };
};

function isAppLocale(value: string): value is AppLocale {
  return (locales as readonly string[]).includes(value);
}

type Brand = "globx" | "quanty";

function getBrand(): Brand {
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
      title: brand === "quanty" ? "Quanty Bot" : "GlobX Bot",
      description: brand === "quanty" ? "Quanty" : "GlobX",
    };
  }

  // [중요 수정]
  // 1. 파일명이 home.json이므로 'home'으로 시작
  // 2. JSON 내부 키가 대문자(Quanty, Globx)이므로 이에 맞춰 변환
  const jsonKey = brand === "quanty" ? "Quanty" : "Globx";

  // 3. namespace를 "home.Quanty" 또는 "home.Globx" 형태로 지정
  // 이렇게 하면 t("metaTitle")만 써도 자동으로 home -> Quanty -> metaTitle을 가져옵니다.
  const t = await getTranslations({ locale, namespace: `home.${jsonKey}` });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function HomePage({ params }: Props) {
  const resolved = await Promise.resolve(params);
  const locale = resolved.locale;

  if (!isAppLocale(locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const brand = getBrand();

  return brand === "quanty" ? <QuantyView /> : <GlobxView />;
}
