// src/app/(site)/account/components/WalletForm.tsx
"use client";

import React, {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ChangeEvent,
} from "react";
import {
  Section,
  Card,
  Button,
  Badge,
  InputField,
  Form,
  Caption,
  Modal, // ✅ 제어형 모달 사용
} from "@/components/ui";
import { useToast } from "@/components/ui";
import { isValidEvmAddress, toChecksumAddress } from "@/utils/wallet";
import { ClipboardDocumentIcon } from "@heroicons/react/24/outline";
import {
  UpdateWalletResponse,
  WalletFormProps,
} from "@/types/account/wallet/types";

// 타입 가드
function isUpdateWalletResponse(x: unknown): x is UpdateWalletResponse {
  if (typeof x !== "object" || x === null) return false;
  const o = x as Record<string, unknown>;
  return typeof o.ok === "boolean";
}

type ToastKind = "info" | "success" | "warning" | "error";

export default function WalletForm(props: WalletFormProps) {
  const { otpEnabled, wallet, onChangeWallet } = props;

  const [addr, setAddr] = useState<string>(wallet ?? "");
  const [valid, setValid] = useState<boolean>(false);

  // OTP 모달
  const [showOtp, setShowOtp] = useState<boolean>(false);
  const [otpCode, setOtpCode] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);
  const [serverErr, setServerErr] = useState<string | null>(null);

  // ✅ Toast 훅
  const { toast } = useToast();
  const showToast = (msg: string, variant: ToastKind = "info"): void => {
    toast({ variant, description: msg });
  };

  useEffect(() => {
    setValid(isValidEvmAddress(addr.trim()));
  }, [addr]);

  useEffect(() => {
    setAddr(wallet ?? "");
  }, [wallet]);

  const alreadyRegistered = useMemo(
    () => (wallet ?? "").trim().length > 0,
    [wallet]
  );

  async function copyCurrent(): Promise<void> {
    try {
      if (!wallet) throw new Error("no wallet");
      await navigator.clipboard.writeText(wallet);
      showToast("출금 지갑 주소를 복사했습니다.", "success");
    } catch {
      showToast("복사 실패. 주소를 직접 선택하여 복사하세요.", "error");
    }
  }

  function onSubmit(e: FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    if (!valid) return;
    if (!otpEnabled) {
      showToast("먼저 계정에서 구글 OTP를 등록하세요.", "warning");
      return;
    }
    setServerErr(null);
    setOtpCode("");
    setShowOtp(true);
  }

  async function confirmOtp(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    if (!valid || otpCode.length !== 6) return;
    setSaving(true);
    setServerErr(null);
    try {
      const checksum = toChecksumAddress(addr.trim());
      if (!checksum) {
        const msg = "지갑 주소가 유효하지 않습니다.";
        setServerErr(msg);
        showToast(msg, "error");
        return;
      }
      const res = await fetch("/api/account/wallet/withdraw", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "same-origin",
        cache: "no-store",
        body: JSON.stringify({ address: checksum, otpCode }),
      });

      const json: unknown = await res.json().catch(() => null);

      if (!res.ok || !isUpdateWalletResponse(json) || json.ok !== true) {
        const code =
          json && typeof json === "object" && "code" in json
            ? (json as { code?: unknown }).code
            : undefined;
        const message =
          json && typeof json === "object" && "message" in json
            ? (json as { message?: unknown }).message
            : undefined;

        const msg =
          (typeof message === "string" && message) ||
          (code === "OTP_REQUIRED"
            ? "OTP 미등록 상태입니다. 먼저 OTP를 등록하세요."
            : code === "OTP_VERIFY_FAILED"
            ? "OTP 코드가 올바르지 않습니다."
            : `저장 실패(HTTP ${res.status})`);
        setServerErr(msg);
        showToast(msg, "error");
        return;
      }

      const withdrawAddress =
        json.wallet && typeof json.wallet === "object"
          ? (json.wallet as { withdrawAddress?: unknown }).withdrawAddress
          : undefined;

      onChangeWallet(
        typeof withdrawAddress === "string" && withdrawAddress
          ? withdrawAddress
          : checksum
      );
      setShowOtp(false);
      showToast("출금 지갑 주소가 등록되었습니다.", "success");
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : typeof err === "string"
          ? err
          : "요청 처리 중 오류";
      setServerErr(msg);
      showToast(msg, "error");
    } finally {
      setSaving(false);
    }
  }

  const handleAddrChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setAddr(e.target.value);
  };

  const handleOtpChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const v = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtpCode(v);
  };

  return (
    <Card
      title="출금 지갑 주소"
      actions={
        <Badge variant={alreadyRegistered ? "success" : "warning"}>
          {alreadyRegistered ? "등록됨" : "미등록"}
        </Badge>
      }
    >
      {/* 등록됨: 읽기 전용 + 복사 버튼 */}
      {alreadyRegistered ? (
        <Section
          layout="two-col"
          columnsTemplate="1fr auto"
          contentClassName="items-end gap-2 max-w-3xl"
          left={
            <InputField
              type="text"
              value={wallet ?? "-"}
              readOnly
              className="font-mono select-all"
              onChange={() => {
                /* read-only */
              }}
              onKeyDown={(e) => {
                if (
                  e.key.length === 1 ||
                  e.key === "Backspace" ||
                  e.key === "Delete"
                ) {
                  e.preventDefault();
                }
              }}
              onBeforeInput={(e) => e.preventDefault()}
              onPaste={(e) => e.preventDefault()}
              onCut={(e) => e.preventDefault()}
              onDrop={(e) => e.preventDefault()}
              autoComplete="off"
              inputMode="text"
              aria-readonly="true"
            />
          }
          right={
            <Button
              type="button"
              variant="outline"
              className="h-10 min-h-10 px-3"
              onClick={copyCurrent}
              aria-label="출금 지갑 주소 복사"
              title="복사"
              disabled={!wallet}
            >
              <ClipboardDocumentIcon className="h-5 w-5" aria-hidden />
            </Button>
          }
        />
      ) : (
        // 미등록: 입력 + 등록
        <Form onSubmit={onSubmit}>
          <InputField
            id="wallet"
            label="지갑 주소"
            value={addr}
            onChange={handleAddrChange}
            placeholder="0x로 시작하는 주소"
          />
          {!valid && addr.trim().length > 0 && (
            <Caption className="text-xs text-[salmon]">
              주소 형식이 올바르지 않거나(EVM 0x + 40 hex), 체크섬이 일치하지
              않습니다.
            </Caption>
          )}
          <Button
            type="submit"
            className="w-full h-11 rounded-xl"
            disabled={!valid}
            title={!valid ? "유효한 EVM 주소를 입력하세요." : "등록"}
          >
            등록
          </Button>
        </Form>
      )}

      {/* ✅ OTP 모달 (UI 컴포넌트로 교체) */}
      <Modal
        title="OTP 인증"
        open={showOtp}
        onOpenChange={setShowOtp}
        preventClose={saving}
        className="w-[92vw] max-w-sm rounded-2xl"
        backdropClassName="bg-black/60"
      >
        <Card className="mb-3">
          <Caption size="sm">
            인증 앱(예: Google Authenticator)에 표시된 6자리 코드를 입력하세요.
          </Caption>
        </Card>

        <Card>
          <Form onSubmit={confirmOtp} styled={false}>
            <InputField
              label="인증 코드"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              placeholder="6자리 코드"
              value={otpCode}
              onChange={handleOtpChange}
            />

            {serverErr ? (
              <Caption className="mt-2 text-[salmon]">{serverErr}</Caption>
            ) : null}

            <Section
              layout="two-col"
              columnsTemplate="1fr 1fr"
              contentClassName="gap-2 mt-4"
              left={
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowOtp(false)}
                  disabled={saving}
                  className="h-10 rounded-xl w-full"
                >
                  취소
                </Button>
              }
              right={
                <Button
                  type="submit"
                  className="h-10 rounded-xl w-full"
                  disabled={saving || otpCode.length !== 6}
                  title={
                    otpCode.length !== 6 ? "6자리 코드를 입력하세요" : "확인"
                  }
                >
                  {saving ? "확인 중…" : "확인"}
                </Button>
              }
            />
          </Form>
        </Card>
      </Modal>
    </Card>
  );
}
