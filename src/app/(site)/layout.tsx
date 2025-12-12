// app/(site)/layout.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;

import MainHeader from "@/components/MainHeader";
import MainFooter from "@/components/MainFooter";
import { headers } from "next/headers";
import { ToastProvider } from "@/components/ui";
import type { ReactNode } from "react";

export default async function SiteLayout({
  children,
}: {
  children: ReactNode;
}) {
  const h = await headers();
  const authed = Boolean(h.get("x-user-id"));
  const rawLevel = h.get("x-user-level");
  const userLevel = Number.isFinite(Number(rawLevel)) ? Number(rawLevel) : 0;

  return (
    <div className="min-h-dvh bg-base-200 text-base-content flex flex-col">
      <MainHeader authed={authed} userLevel={userLevel} />

      {/* ToastProvider는 SignupForm이 들어가는 트리를 감싸야 함 */}
      <ToastProvider>
        <main
          className="
            flex-1
            container mx-auto
            px-4 py-4
            pb-[calc(64px+env(safe-area-inset-bottom))]
          "
        >
          {children}
        </main>
      </ToastProvider>

      <MainFooter />
    </div>
  );
}
