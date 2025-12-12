// app/layout.tsx
import { ToastProvider } from "@/components/ui";
import "@/styles/globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // 초기 테마를 blue로. ThemeSwitcher가 런타임에 교체합니다.
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      {/* 전역 배경/텍스트, 높이만 설정 */}
      <body className="min-h-dvh m-0 bg-base-200 text-base-content">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
