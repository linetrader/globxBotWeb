"use client";

import { useEffect, useMemo, useState, type ReactElement } from "react";
import ReferralCode from "./components/ReferralCode";
import AccountInfoForm from "./components/AccountInfoForm";
import ChangePasswordForm from "./components/ChangePasswordForm";
import OtpSection from "./components/OtpSection";
import WalletForm from "./components/WalletForm";
import { useToast } from "@/components/ui";
import {
  AccountProfile,
  ApiErr,
  ApiRes,
  ProfileState,
} from "@/types/account/types";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import { useTranslations } from "next-intl";

export default function AccountPage(): ReactElement {
  const t = useTranslations("account");
  const { toast } = useToast();

  const [p, setP] = useState<ProfileState>({
    username: "",
    email: "",
    name: "",
    countryCode: null,
    countryName: null,
    wallet: "",
    refCode: "",
    otpEnabled: false,
    otpSecret: "",
    otpQr: "",
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    let ignore = false;

    (async () => {
      try {
        if (!ignore) {
          setLoading(true);
          setLoadError(null);
        }

        const res = await fetch("/api/account", {
          method: "GET",
          headers: { Accept: "application/json" },
          cache: "no-store",
          credentials: "same-origin",
          signal: ac.signal,
        });

        const json = (await res.json().catch(() => null)) as ApiRes<{
          profile: AccountProfile;
        }> | null;

        if (!res.ok || !json || json.ok !== true) {
          const msg =
            (json as ApiErr | null)?.message ??
            t("error.loadFailed", { status: res.status });
          throw new Error(msg);
        }

        const prof = json.profile;
        if (!ignore) {
          setP({
            username: prof.username,
            email: prof.email,
            name: prof.name,
            countryCode: prof.country?.code ?? null,
            countryName: prof.country?.name ?? null,
            wallet: prof.wallet?.withdrawAddress ?? "",
            refCode: prof.referralCode,
            otpEnabled: prof.googleOtpEnabled,
            otpSecret: "",
            otpQr: "",
          });
        }
      } catch (e: unknown) {
        if (ac.signal.aborted || (e as Error)?.name === "AbortError") return;
        if (!ignore) {
          setLoadError((e as Error)?.message || t("error.loadUnknown"));
        }
      } finally {
        if (!ignore && !ac.signal.aborted) setLoading(false);
      }
    })();

    return () => {
      ignore = true;
      ac.abort();
    };
  }, [t]);

  const refLink = useMemo(() => {
    const code = p.refCode?.trim();
    if (!code) return "";
    const base =
      typeof window !== "undefined"
        ? window.location.origin
        : process.env.NEXT_PUBLIC_APP_ORIGIN || "";
    return `${base}/auth/signup?ref=${encodeURIComponent(code)}`;
  }, [p.refCode]);

  async function copyRefLink(): Promise<void> {
    if (!refLink) return;
    try {
      await navigator.clipboard.writeText(refLink);
      toast({
        title: t("toast.copySuccess"),
        description: t("toast.refLinkCopied"),
      });
    } catch {
      toast({
        title: t("toast.copyFail"),
        description: t("toast.copyManual"),
        variant: "error",
      });
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 [:root[data-theme=dark]_&]:bg-[#0B1222]">
        <span className="loading loading-spinner loading-lg text-[#06b6d4]"></span>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen p-8 flex justify-center bg-gray-50 [:root[data-theme=dark]_&]:bg-[#0B1222]">
        <div className="alert alert-error max-w-lg bg-red-100 border-red-200 text-red-600 [:root[data-theme=dark]_&]:bg-red-900/20 [:root[data-theme=dark]_&]:border-red-900/50 [:root[data-theme=dark]_&]:text-red-200">
          <span>{loadError}</span>
        </div>
      </div>
    );
  }

  return (
    // [수정] 라이트: bg-gray-50/text-gray-900 ↔ 다크: bg-[#0B1222]/text-gray-100
    <div className="min-h-screen p-6 md:p-8 transition-colors duration-300 bg-gray-50 text-gray-900 [:root[data-theme=dark]_&]:bg-[#0B1222] [:root[data-theme=dark]_&]:text-gray-100">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* 헤더 */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-[#06b6d4]/10 rounded-lg">
            <UserCircleIcon className="h-8 w-8 text-[#06b6d4]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 [:root[data-theme=dark]_&]:text-white">
              {t("page.title")}
            </h1>
            <p className="text-sm text-gray-500 [:root[data-theme=dark]_&]:text-gray-400">
              {t("page.subtitle")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* 0) 레퍼럴 코드 */}
          <ReferralCode refLink={refLink} onCopy={copyRefLink} />

          {/* 1) 계정 정보 */}
          <AccountInfoForm
            username={p.username}
            email={p.email}
            name={p.name}
            countryLabel={
              p.countryName && p.countryCode
                ? `${p.countryName} (${p.countryCode})`
                : p.countryCode || "-"
            }
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 2) OTP */}
            <OtpSection
              email={p.email}
              otpEnabled={p.otpEnabled}
              otpSecret={p.otpSecret}
              otpQr={p.otpQr}
              setOtpSecret={(v) => setP((prev) => ({ ...prev, otpSecret: v }))}
              setOtpQr={(v) => setP((prev) => ({ ...prev, otpQr: v }))}
              onActivated={() =>
                setP((prev) => ({ ...prev, otpEnabled: true }))
              }
            />

            {/* 3) 지갑 */}
            <WalletForm
              email={p.email}
              otpEnabled={p.otpEnabled}
              wallet={p.wallet}
              onChangeWallet={(v) => setP((prev) => ({ ...prev, wallet: v }))}
            />
          </div>

          {/* 4) 비밀번호 변경 */}
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
}
