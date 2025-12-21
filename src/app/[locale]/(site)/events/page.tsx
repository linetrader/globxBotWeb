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

  if (!isAppLocale(locale)) {
    return {};
  }

  const brand = getBrand();

  // JSON 키 매칭: event.GlobX 또는 event.Quanty
  const jsonKey = brand === "quanty" ? "Quanty" : "GlobX";

  // namespace를 'event.Quanty' 또는 'event.GlobX'로 지정
  const t = await getTranslations({ locale, namespace: `event.${jsonKey}` });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function EventsPage({ params }: Props) {
  const resolved = await Promise.resolve(params);
  const locale = resolved.locale;

  if (!isAppLocale(locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const brand = getBrand();

  return brand === "quanty" ? <QuantyView /> : <GlobxView />;
}
