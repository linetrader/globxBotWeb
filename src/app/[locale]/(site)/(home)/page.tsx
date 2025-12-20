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
  const raw = (process.env.BRAND_NAME ?? "").trim().toLowerCase();
  if (raw === "quanty") return "quanty";
  return "globx";
}

export async function generateMetadata({ params }: Props) {
  const resolved = await Promise.resolve(params);
  const locale = resolved.locale;

  const brand = getBrand();

  if (!isAppLocale(locale)) {
    // locale가 이상할 때 fallback 메타
    return {
      title: brand === "quanty" ? "Quanty Bot" : "GlobX Bot",
      description: brand === "quanty" ? "Quanty" : "GlobX",
    };
  }

  const t = await getTranslations({ locale, namespace: "home" });

  // 기존 번역키(metaTitle/metaDescription)를 그대로 쓰되,
  // 필요하면 브랜드별로 번역 키를 나눠도 됨.
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
