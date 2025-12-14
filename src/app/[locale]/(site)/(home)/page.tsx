// src/app/[locale]/(site)/(home)/page.tsx

import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { locales, type AppLocale } from "@/i18n/routing";
import { AboutView } from "./views/AboutView";

type Props = {
  params: Promise<{ locale: string }> | { locale: string };
};

function isAppLocale(value: string): value is AppLocale {
  return (locales as readonly string[]).includes(value);
}

export async function generateMetadata({ params }: Props) {
  const resolved = await Promise.resolve(params);
  const locale = resolved.locale;

  if (!isAppLocale(locale)) {
    return {
      title: "GlobX Bot",
      description: "GlobX",
    };
  }

  const t = await getTranslations({ locale, namespace: "home" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function AboutPage({ params }: Props) {
  const resolved = await Promise.resolve(params);
  const locale = resolved.locale;

  if (!isAppLocale(locale)) {
    notFound();
  }

  // next-intl 권장: 서버에서 locale 고정/전파
  setRequestLocale(locale);

  // 실제 렌더링은 Client View로 분리
  return <AboutView />;
}
