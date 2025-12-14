"use client";

import React, { useEffect, useState, type FormEvent } from "react";
import QRCode from "qrcode";
import Image from "next/image";
import { useToast } from "@/components/ui";
import { OtpSectionProps } from "@/types/account/otp/types";
import { useTranslations } from "next-intl";
import { ShieldCheckIcon } from "@heroicons/react/24/outline"; // [수정] QrCodeIcon 제거

export default function OtpSection({
  email,
  otpEnabled,
  otpSecret,
  otpQr,
  setOtpSecret,
  setOtpQr,
  onActivated,
}: OtpSectionProps) {
  const t = useTranslations("account");
  const { toast } = useToast();
  const [otpCode, setOtpCode] = useState<string>("");

  useEffect(() => {
    if (otpEnabled || otpSecret) return;

    let aborted = false;
    (async () => {
      try {
        const r = await fetch("/api/account/otp/init", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ email }),
        });
        if (!r.ok) throw new Error("init failed");

        const { secretBase32, otpauth } = await r.json();
        const dataUrl = await QRCode.toDataURL(otpauth, {
          width: 220,
          margin: 1,
          color: { dark: "#000000", light: "#ffffff" },
          errorCorrectionLevel: "M",
        });

        if (!aborted) {
          setOtpSecret(secretBase32);
          setOtpQr(dataUrl);
        }
      } catch {
        // [수정] 사용하지 않는 e 제거
        if (!aborted) {
          setOtpSecret("");
          setOtpQr("");
        }
      }
    })();

    return () => {
      aborted = true;
    };
  }, [email, otpEnabled, otpSecret, setOtpQr, setOtpSecret]);

  async function registerOtp(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    if (otpEnabled || !otpSecret || otpCode.length !== 6) return;

    const res = await fetch("/api/account/otp/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ email, code: otpCode }),
    });

    if (!res.ok) {
      const { message } = await res
        .json()
        .catch(() => ({ message: t("otp.registerFail") }));
      toast({
        variant: "error",
        description: message ?? t("otp.registerFail"),
      });
      return;
    }

    toast({ variant: "success", description: t("otp.registerSuccess") });
    onActivated();
    setOtpCode("");
  }

  // [수정] 공통 스타일
  const inputClass =
    "input input-bordered w-full transition-colors h-10 text-sm text-center tracking-widest font-mono " +
    "bg-white border-gray-300 text-gray-900 focus:border-[#06b6d4] focus:outline-none " +
    "[:root[data-theme=dark]_&]:bg-[#0B1222] [:root[data-theme=dark]_&]:border-gray-700 [:root[data-theme=dark]_&]:text-gray-200";

  return (
    // [수정] 카드 컨테이너
    <div className="flex flex-col h-full rounded-2xl shadow-xl overflow-hidden border transition-colors bg-white border-gray-200 [:root[data-theme=dark]_&]:bg-[#131B2D] [:root[data-theme=dark]_&]:border-gray-800">
      <div className="p-5 border-b flex items-center justify-between transition-colors bg-gray-50 border-gray-200 [:root[data-theme=dark]_&]:bg-[#0B1222]/30 [:root[data-theme=dark]_&]:border-gray-800">
        <div className="flex items-center gap-2">
          <ShieldCheckIcon className="h-5 w-5 text-[#06b6d4]" />
          <h2 className="text-base font-bold text-gray-900 [:root[data-theme=dark]_&]:text-gray-200">
            {t("otp.title")}
          </h2>
        </div>
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${otpEnabled ? "bg-green-100 text-green-600 border-green-200 [:root[data-theme=dark]_&]:bg-green-500/10 [:root[data-theme=dark]_&]:text-green-500 [:root[data-theme=dark]_&]:border-green-500/20" : "bg-yellow-100 text-yellow-600 border-yellow-200 [:root[data-theme=dark]_&]:bg-yellow-500/10 [:root[data-theme=dark]_&]:text-yellow-500 [:root[data-theme=dark]_&]:border-yellow-500/20"}`}
        >
          {otpEnabled ? t("status.registered") : t("status.unregistered")}
        </span>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-center">
        {otpEnabled ? (
          <div className="text-center py-8">
            <ShieldCheckIcon className="h-16 w-16 mx-auto mb-4 opacity-50 text-green-500" />
            <p className="text-sm text-gray-500 [:root[data-theme=dark]_&]:text-gray-400">
              {t("otp.alreadyEnabled")}
            </p>
          </div>
        ) : (
          <form
            onSubmit={registerOtp}
            className="flex flex-col items-center gap-4"
          >
            <div className="bg-white p-2 rounded-xl border border-gray-200">
              {otpQr ? (
                <Image
                  src={otpQr}
                  alt="OTP QR"
                  width={160}
                  height={160}
                  className="rounded-lg"
                  unoptimized
                />
              ) : (
                <div className="w-40 h-40 bg-gray-200 animate-pulse rounded-lg" />
              )}
            </div>

            <p className="text-xs text-center max-w-xs text-gray-500 [:root[data-theme=dark]_&]:text-gray-500">
              {t("otp.scanDesc")}
            </p>

            <div className="w-full space-y-3 mt-2">
              <div className="p-2 rounded border text-center transition-colors bg-gray-50 border-gray-200 [:root[data-theme=dark]_&]:bg-[#0B1222] [:root[data-theme=dark]_&]:border-gray-700">
                <span className="text-xs block mb-1 text-gray-500 [:root[data-theme=dark]_&]:text-gray-500">
                  {t("otp.secretKey")}
                </span>
                <code className="text-xs font-mono break-all text-[#06b6d4]">
                  {otpSecret || "..."}
                </code>
              </div>

              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="000000"
                value={otpCode}
                onChange={(e) =>
                  setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                className={inputClass}
              />

              <button
                type="submit"
                className="btn btn-primary w-full bg-[#06b6d4] hover:bg-[#0891b2] border-none text-white shadow-md shadow-cyan-500/20 [:root[data-theme=dark]_&]:shadow-cyan-900/20"
                disabled={!otpSecret || otpCode.length !== 6}
              >
                {t("otp.registerBtn")}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
