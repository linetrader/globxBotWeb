// app/account/page.tsx
"use client";

import { useEffect, useMemo, useState, type ReactElement } from "react";
import ReferralCode from "./components/ReferralCode";
import AccountInfoForm from "./components/AccountInfoForm";
import ChangePasswordForm from "./components/ChangePasswordForm";
import OtpSection from "./components/OtpSection";
import WalletForm from "./components/WalletForm";
import { Section, Card, Badge, Alert, Toast, Caption } from "@/components/ui";
import {
  AccountProfile,
  ApiErr,
  ApiRes,
  ProfileState,
} from "@/types/account/types";

export default function AccountPage(): ReactElement {
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
  const [toast, setToast] = useState<{
    msg: string;
    type: "info" | "error";
  } | null>(null);

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

        //const json = (await res.json().catch(() => null)) as ApiRes | null;
        const json = (await res.json().catch(() => null)) as ApiRes<{
          profile: AccountProfile;
        }> | null;

        if (!res.ok || !json || json.ok !== true) {
          const msg =
            (json as ApiErr | null)?.message ??
            `프로필 조회 실패 (HTTP ${res.status})`;
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
          setLoadError(
            (e as Error)?.message || "프로필 로드 중 오류가 발생했습니다."
          );
        }
      } finally {
        if (!ignore && !ac.signal.aborted) setLoading(false);
      }
    })();

    return () => {
      ignore = true;
      ac.abort();
    };
  }, []);

  // 레퍼럴 링크 생성 (/auth/signup?ref=CODE)
  const refLink = useMemo(() => {
    const code = p.refCode?.trim();
    if (!code) return "";
    const base =
      typeof window !== "undefined"
        ? window.location.origin
        : process.env.NEXT_PUBLIC_APP_ORIGIN || "";
    return `${base}/auth/signup?ref=${encodeURIComponent(code)}`;
  }, [p.refCode]);

  // 링크 복사
  async function copyRefLink(): Promise<void> {
    if (!refLink) return;
    try {
      await navigator.clipboard.writeText(refLink);
      setToast({ msg: "레퍼럴 링크가 복사되었습니다.", type: "info" });
    } catch {
      setToast({
        msg: "복사 실패. 링크를 직접 선택하여 복사하세요.",
        type: "error",
      });
    }
    setTimeout(() => setToast(null), 2000);
  }

  if (loading) {
    return (
      <Section actions={<Badge variant="info">불러오는 중</Badge>}>
        <Card>
          <Caption>프로필을 불러오는 중…</Caption>
        </Card>
      </Section>
    );
  }

  if (loadError) {
    return (
      <Section title="내 계정" actions={<Badge variant="error">오류</Badge>}>
        <Card>
          <Alert variant="error">{loadError}</Alert>
        </Card>
      </Section>
    );
  }

  return (
    <Section className="mx-auto max-w-screen-md px-4 pt-4 pb-24 space-y-6">
      {/* Toast 알림 */}
      {toast && (
        <Toast position="top-right" variant={toast.type}>
          {toast.msg}
        </Toast>
      )}

      {/* 0) 회원가입 레퍼럴 링크 */}
      <ReferralCode refLink={refLink} onCopy={copyRefLink} />

      {/* 1) 계정 정보(읽기 전용) */}
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

      {/* 2) 구글 OTP 정보/등록 */}
      <OtpSection
        email={p.email}
        otpEnabled={p.otpEnabled}
        otpSecret={p.otpSecret}
        otpQr={p.otpQr}
        setOtpSecret={(v) => setP((prev) => ({ ...prev, otpSecret: v }))}
        setOtpQr={(v) => setP((prev) => ({ ...prev, otpQr: v }))}
        onActivated={() => setP((prev) => ({ ...prev, otpEnabled: true }))}
      />

      {/* 3) 출금 지갑 주소 등록 */}
      <WalletForm
        email={p.email}
        otpEnabled={p.otpEnabled}
        wallet={p.wallet}
        onChangeWallet={(v) => setP((prev) => ({ ...prev, wallet: v }))}
      />

      {/* 4) 비밀번호 변경 */}
      <ChangePasswordForm />
    </Section>
  );
}
