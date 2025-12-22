import { ReactNode } from "react";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import type { Metadata } from "next";

const inter = Inter({ subsets: ["latin"] });

// 환경변수에 따라 파비콘 경로 결정
const BRAND = process.env.NEXT_PUBLIC_BRAND_NAME;

// [수정] 파일명 대소문자 주의: public 폴더 기준 경로
// Quanty: /favicon-quant.ico
// GlobX: /favicon-globx.ico
const faviconUrl =
  BRAND === "Quanty" ? "/favicon-quant.ico" : "/favicon-globx.ico";

// 전역 메타데이터 설정 (파비콘)
// 하위 layout.tsx(locale)에서 title을 설정하더라도 icons는 여기서 상속받아 병합됩니다.
export const metadata: Metadata = {
  icons: {
    icon: faviconUrl,
    shortcut: faviconUrl,
    apple: faviconUrl,
  },
};

// App Router의 필수 루트 레이아웃
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="ko" // 기본값 설정 (하위에서 덮어씌워짐)
      data-theme="dark" // 글로벌 테마 설정
      className={inter.className} // 폰트 클래스 적용
      suppressHydrationWarning // 하이드레이션 경고를 막기 위한 최종 수단
    >
      <body>{children}</body>
    </html>
  );
}
