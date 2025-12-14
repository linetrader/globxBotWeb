"use client";

import React, { useEffect, useMemo, useState, type FormEvent } from "react";
import { useToast } from "@/components/ui";
import { isValidEvmAddress, toChecksumAddress } from "@/utils/wallet";
import {
  WalletIcon,
  // [수정] CheckIcon 제거 (사용하지 않음)
  ClipboardDocumentIcon,
} from "@heroicons/react/24/outline";
import { WalletFormProps } from "@/types/account/wallet/types";
import { useTranslations } from "next-intl";

// [추가] OtpModal Props 타입 정의
interface OtpModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (code: string) => void | Promise<void>;
  loading: boolean;
  error: string | null;
}

// [수정] any 대신 인터페이스 적용
function OtpModal({ open, onClose, onConfirm, loading, error }: OtpModalProps) {
  const [code, setCode] = useState("");
  const t = useTranslations("account");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm overflow-hidden shadow-2xl rounded-2xl border bg-white border-gray-200 [:root[data-theme=dark]_&]:bg-[#131B2D] [:root[data-theme=dark]_&]:border-gray-700">
        <div className="p-5 border-b bg-gray-50 border-gray-200 [:root[data-theme=dark]_&]:bg-[#0B1222]/50 [:root[data-theme=dark]_&]:border-gray-800">
          <h3 className="text-lg font-bold text-gray-900 [:root[data-theme=dark]_&]:text-white">
            {t("wallet.otpVerify")}
          </h3>
          <p className="text-xs mt-1 text-gray-500 [:root[data-theme=dark]_&]:text-gray-400">
            {t("wallet.otpVerifyDesc")}
          </p>
        </div>
        <div className="p-5 space-y-4">
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            className="input input-bordered w-full text-center text-lg tracking-widest font-mono focus:border-[#06b6d4] focus:outline-none bg-white border-gray-300 text-gray-900 [:root[data-theme=dark]_&]:bg-[#0B1222] [:root[data-theme=dark]_&]:border-gray-700 [:root[data-theme=dark]_&]:text-gray-100"
            value={code}
            onChange={(e) =>
              setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
          />
          {error && <p className="text-xs text-center text-red-500">{error}</p>}

          <div className="flex gap-2 pt-2">
            <button
              className="btn btn-ghost flex-1 text-gray-500 hover:bg-gray-100 [:root[data-theme=dark]_&]:text-gray-400 [:root[data-theme=dark]_&]:hover:text-white"
              onClick={onClose}
              disabled={loading}
            >
              {t("action.cancel")}
            </button>
            <button
              className="btn btn-primary flex-1 bg-[#06b6d4] border-none text-white hover:bg-[#0891b2]"
              onClick={() => onConfirm(code)}
              disabled={code.length !== 6 || loading}
            >
              {loading ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : (
                t("action.confirm")
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WalletForm(props: WalletFormProps) {
  const t = useTranslations("account");
  const { otpEnabled, wallet, onChangeWallet } = props;
  const { toast } = useToast();

  const [addr, setAddr] = useState<string>(wallet ?? "");
  const [valid, setValid] = useState<boolean>(false);
  const [showOtp, setShowOtp] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [serverErr, setServerErr] = useState<string | null>(null);

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

  const handleCopy = async () => {
    if (!wallet) return;
    try {
      await navigator.clipboard.writeText(wallet);
      toast({ description: t("toast.walletCopied"), variant: "success" });
    } catch {
      toast({ description: t("toast.copyFail"), variant: "error" });
    }
  };

  const onRegisterClick = (e: FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    if (!otpEnabled) {
      toast({ description: t("wallet.requireOtp"), variant: "warning" });
      return;
    }
    setServerErr(null);
    setShowOtp(true);
  };

  const handleConfirmOtp = async (code: string) => {
    setSaving(true);
    setServerErr(null);
    try {
      const checksum = toChecksumAddress(addr.trim());
      if (!checksum) throw new Error(t("wallet.invalidAddress"));

      const res = await fetch("/api/account/wallet/withdraw", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: checksum, otpCode: code }),
      });

      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.message || t("wallet.saveFail"));
      }

      onChangeWallet(json.wallet?.withdrawAddress || checksum);
      setShowOtp(false);
      toast({ description: t("wallet.saveSuccess"), variant: "success" });
    } catch (err: unknown) {
      // [수정] any 제거 및 타입 가드 사용
      const msg = err instanceof Error ? err.message : String(err);
      setServerErr(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    // [수정] 카드 컨테이너
    <div className="flex flex-col h-full rounded-2xl shadow-xl overflow-hidden border transition-colors bg-white border-gray-200 [:root[data-theme=dark]_&]:bg-[#131B2D] [:root[data-theme=dark]_&]:border-gray-800">
      <div className="p-5 border-b flex items-center justify-between transition-colors bg-gray-50 border-gray-200 [:root[data-theme=dark]_&]:bg-[#0B1222]/30 [:root[data-theme=dark]_&]:border-gray-800">
        <div className="flex items-center gap-2">
          <WalletIcon className="h-5 w-5 text-[#06b6d4]" />
          <h2 className="text-base font-bold text-gray-900 [:root[data-theme=dark]_&]:text-gray-200">
            {t("wallet.title")}
          </h2>
        </div>
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${alreadyRegistered ? "bg-green-100 text-green-600 border-green-200 [:root[data-theme=dark]_&]:bg-green-500/10 [:root[data-theme=dark]_&]:text-green-500 [:root[data-theme=dark]_&]:border-green-500/20" : "bg-gray-100 text-gray-500 border-gray-200 [:root[data-theme=dark]_&]:bg-gray-700/50 [:root[data-theme=dark]_&]:text-gray-400 [:root[data-theme=dark]_&]:border-gray-600"}`}
        >
          {alreadyRegistered
            ? t("status.registered")
            : t("status.unregistered")}
        </span>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-center">
        {alreadyRegistered ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl border break-all text-center transition-colors bg-gray-50 border-gray-200 [:root[data-theme=dark]_&]:bg-[#0B1222] [:root[data-theme=dark]_&]:border-gray-800">
              <span className="text-xs block mb-2 text-gray-500 [:root[data-theme=dark]_&]:text-gray-500">
                {t("wallet.currentAddress")}
              </span>
              <span className="text-sm font-mono text-[#06b6d4]">{wallet}</span>
            </div>
            <button
              onClick={handleCopy}
              className="btn btn-outline btn-sm w-full border-gray-300 text-gray-500 hover:text-gray-900 hover:border-gray-400 [:root[data-theme=dark]_&]:border-gray-700 [:root[data-theme=dark]_&]:text-gray-300 [:root[data-theme=dark]_&]:hover:text-white [:root[data-theme=dark]_&]:hover:border-gray-500"
            >
              <ClipboardDocumentIcon className="h-4 w-4 mr-2" />
              {t("action.copy")}
            </button>
          </div>
        ) : (
          <form onSubmit={onRegisterClick} className="space-y-4">
            <div>
              <label className="text-xs mb-1.5 block text-gray-600 [:root[data-theme=dark]_&]:text-gray-500">
                {t("wallet.inputLabel")}
              </label>
              <input
                className="input input-bordered w-full h-11 text-sm focus:border-[#06b6d4] bg-white border-gray-300 text-gray-900 [:root[data-theme=dark]_&]:bg-[#0B1222] [:root[data-theme=dark]_&]:border-gray-700 [:root[data-theme=dark]_&]:text-gray-200"
                placeholder="0x..."
                value={addr}
                onChange={(e) => setAddr(e.target.value)}
              />
              {!valid && addr.length > 0 && (
                <p className="text-[10px] text-red-500 mt-1">
                  {t("wallet.invalidFormat")}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={!valid}
              className="btn btn-primary w-full bg-[#06b6d4] hover:bg-[#0891b2] border-none text-white h-11 shadow-md shadow-cyan-500/20 [:root[data-theme=dark]_&]:shadow-cyan-900/20"
            >
              {t("wallet.registerBtn")}
            </button>
          </form>
        )}
      </div>

      <OtpModal
        open={showOtp}
        onClose={() => setShowOtp(false)}
        onConfirm={handleConfirmOtp}
        loading={saving}
        error={serverErr}
      />
    </div>
  );
}
