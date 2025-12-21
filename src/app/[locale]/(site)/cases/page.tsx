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

  // [수정] JSON의 키 이름과 정확히 일치시켜야 합니다 (GlobX)
  const jsonKey = brand === "quanty" ? "Quanty" : "GlobX";

  // namespace: 'cases.GlobX' -> cases.json 파일 안의 GlobX 키를 찾음
  const t = await getTranslations({ locale, namespace: `cases.${jsonKey}` });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function CasesPage({ params }: Props) {
  const resolved = await Promise.resolve(params);
  const locale = resolved.locale;

  if (!isAppLocale(locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const brand = getBrand();

  return brand === "quanty" ? <QuantyView /> : <GlobxView />;
}
