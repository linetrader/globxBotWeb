import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { locales, type AppLocale } from "@/i18n/routing";
import { GlobxView } from "./views/Globx";
import { QuantyView } from "./views/Quanty";

type Props = {
  params: Promise<{ locale: string }>;
};

// 허용된 로케일인지 확인하는 함수
function isAppLocale(value: string): value is AppLocale {
  return (locales as readonly string[]).includes(value);
}

// .env 파일의 브랜드 네임을 그대로 사용 (GlobX 또는 Quanty)
const BRAND_NAME = process.env.NEXT_PUBLIC_BRAND_NAME;

export async function generateMetadata({ params }: Props) {
  const resolved = await Promise.resolve(params);
  const locale = resolved.locale;

  if (!isAppLocale(locale)) {
    return {};
  }

  // [수정] 환경변수 값에 따라 JSON 키 결정 (대소문자 변환 없음)
  // 환경변수가 'Quanty'가 아니면 기본값으로 'GlobX' 사용
  const jsonKey = BRAND_NAME === "Quanty" ? "Quanty" : "GlobX";

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

  // [수정] 브랜드 네임에 따라 명확하게 컴포넌트 분기
  return BRAND_NAME === "Quanty" ? <QuantyView /> : <GlobxView />;
}
