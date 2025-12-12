// src/app/(site)/account/components/OtpSection.tsx
"use client";

import React, { useEffect, useState, type FormEvent } from "react";
import QRCode from "qrcode";
import Image from "next/image";
import {
  Section,
  Card,
  Button,
  Badge,
  InputField,
  Caption,
  Form,
  SquarePlaceholder,
} from "@/components/ui";
import { useToast } from "@/components/ui";
import { OtpSectionProps } from "@/types/account/otp/types";

export default function OtpSection({
  email,
  otpEnabled,
  otpSecret,
  otpQr,
  setOtpSecret,
  setOtpQr,
  onActivated,
}: OtpSectionProps) {
  const [otpCode, setOtpCode] = useState<string>("");

  // ✅ Toast 훅
  const { toast } = useToast();

  // 서버에서 시크릿/otpauth 생성 후 QR 생성
  useEffect(() => {
    if (otpEnabled || otpSecret) return;

    let aborted = false;
    (async () => {
      try {
        const r = await fetch("/api/account/otp/init", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          // ✅ issuer 제거 (백엔드가 OTP_ISSUER 사용)
          body: JSON.stringify({ email }),
        });
        if (!r.ok) throw new Error("init failed");

        const {
          secretBase32,
          otpauth,
        }: { secretBase32: string; otpauth: string } = await r.json();

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
      } catch (e) {
        console.error("OTP init error:", e);
        if (!aborted) {
          setOtpSecret("");
          setOtpQr("");
          toast({ variant: "error", description: "OTP 초기화 실패" });
        }
      }
    })();

    return () => {
      aborted = true;
    };
  }, [email, otpEnabled, otpSecret, setOtpQr, setOtpSecret, toast]);

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
      const { message }: { message?: string } = await res
        .json()
        .catch(() => ({ message: "등록 실패" }));
      toast({ variant: "error", description: message ?? "등록 실패" });
      return;
    }

    toast({ variant: "success", description: "OTP가 등록(활성화)되었습니다." });
    onActivated();
    setOtpCode("");
  }

  return (
    <Card
      title="구글 OTP"
      actions={
        <Badge variant={otpEnabled ? "success" : "warning"}>
          {otpEnabled ? "등록됨" : "미등록"}
        </Badge>
      }
    >
      {otpEnabled ? (
        <Caption>이 계정은 OTP가 활성화되어 있습니다.</Caption>
      ) : (
        <Form onSubmit={registerOtp} className="grid-cols-1 sm:grid-cols-2">
          {/* QR 영역 */}
          <Section className="grid place-items-center">
            {otpQr ? (
              <Image
                src={otpQr} // data:image/png;base64,... 허용
                alt="OTP QR"
                width={220}
                height={220}
                className="rounded-xl border border-line bg-white p-3 mb-3"
                // className="h-[220px] w-[220px] rounded"
                priority
              />
            ) : (
              <SquarePlaceholder>QR 생성 중…</SquarePlaceholder>
            )}
            <Caption>Google Authenticator로 스캔</Caption>
          </Section>

          {/* 코드 입력 및 시크릿 표시 */}
          <Section>
            <InputField
              label="시크릿(백업용)"
              className="mb-5"
              type="text"
              value={otpSecret || "(생성 중)"}
              readOnly
            />

            <InputField
              label="인증 앱 코드(6자리)"
              className="mb-3"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              placeholder="6자리 코드"
              value={otpCode}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, "").slice(0, 6);
                setOtpCode(v);
              }}
            />

            <Button
              type="submit"
              className="w-full h-11 rounded-xl mt-3 mb-6"
              disabled={!otpSecret || otpCode.length !== 6}
              title={!otpSecret ? "시크릿 생성 중" : "OTP 등록"}
            >
              OTP 등록
            </Button>

            <Caption>* 등록 후에는 백업 코드를 안전한 곳에 보관하세요.</Caption>
          </Section>
        </Form>
      )}
    </Card>
  );
}
