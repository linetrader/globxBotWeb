// src/app/[locale]/layout.tsx

import { NextIntlClientProvider } from "next-intl";
import { ReactNode } from "react";
// 폰트 import는 루트 layout으로 이동했으나, metadata와 기타 로직을 위해 Next.js 기본 심볼은 유지
import { notFound } from "next/navigation";
// 💡 [수정] routing 객체를 제거하고 LOCALES만 import
import { LOCALES } from "@/i18n/routing";
import { getMessages } from "next-intl/server";
import { ToastProvider } from "@/components/ui"; // ClientProvider 내부에 유지

// 폰트 import는 루트 layout.tsx로 이동해야 합니다.
// const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Global Trading Bot",
  description: "AI 기반 자동 거래 시스템",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  // Next.js 13/14 호환성을 위한 Promise Union Type 유지
  params: Promise<{ locale: string }> | { locale: string };
}) {
  // [핵심 수정] params를 await 하여 locale을 안전하게 추출합니다.
  const resolvedParams = await Promise.resolve(params);
  const { locale } = resolvedParams;

  // 1. 들어온 locale이 유효한지 검사
  // 💡 [수정] LOCALES를 사용하여 유효성 검사 (코드 유지)
  if (!(LOCALES as readonly string[]).includes(locale)) {
    notFound();
  }

  // 2. 메시지 로딩을 next-intl 서버 함수에 위임 (src/i18n/request.ts 사용)
  const messages = await getMessages({ locale });

  // [핵심 수정] <html> 및 <body> 태그 제거
  return (
    // 💡 [중요] Locale 정보를 <html> 태그에 동적으로 적용하려면,
    // 다음과 같이 RSC 훅을 사용하여 Next.js 메커니즘을 이용하거나
    // <html lang={locale}>을 다시 사용해야 합니다.
    // 하지만, 이중 <html> 문제로 인해 구조를 유지하고,
    // next-intl이 내부적으로 lang 속성을 처리하도록 맡깁니다.
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ToastProvider>{children}</ToastProvider>
    </NextIntlClientProvider>
  );
}
