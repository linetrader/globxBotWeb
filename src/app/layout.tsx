// src/app/layout.tsx

import { ReactNode } from "react";
// 폰트와 글로벌 CSS는 최상위 레이아웃에서 import 합니다.
import { Inter } from "next/font/google";
import "@/styles/globals.css";

const inter = Inter({ subsets: ["latin"] });

// App Router의 필수 루트 레이아웃
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // [핵심]: <html> 태그에 폰트 클래스와 기본 언어, 기본 테마를 설정합니다.
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
