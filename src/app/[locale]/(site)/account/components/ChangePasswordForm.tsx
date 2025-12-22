"use client";

import React, { useState, type FormEvent } from "react";
import { useToast } from "@/components/ui";
import { useTranslations } from "next-intl";
import {
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";

// [추가] 내부 컴포넌트 Props 타입 정의
interface PwdInputProps {
  label: string;
  val: string;
  setVal: React.Dispatch<React.SetStateAction<string>>;
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
}

// 💡 [수정] 컴포넌트 정의를 메인 함수 밖으로 이동 (리렌더링 시 포커스 유지)
const PwdInput = ({ label, val, setVal, show, setShow }: PwdInputProps) => (
  <div className="form-control">
    <label className="label py-1">
      <span className="text-xs font-medium text-gray-600 [:root[data-theme=dark]_&]:text-gray-500">
        {label}
      </span>
    </label>
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        className="input input-bordered w-full transition-colors h-10 text-sm pr-10 bg-white border-gray-300 text-gray-900 focus:border-[#06b6d4] [:root[data-theme=dark]_&]:bg-[#0B1222] [:root[data-theme=dark]_&]:border-gray-700 [:root[data-theme=dark]_&]:text-gray-200"
        value={val}
        onChange={(e) => setVal(e.target.value)}
      />
      <button
        type="button"
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 [:root[data-theme=dark]_&]:text-gray-500 [:root[data-theme=dark]_&]:hover:text-gray-300"
        onClick={() => setShow(!show)}
      >
        {show ? (
          <EyeSlashIcon className="h-4 w-4" />
        ) : (
          <EyeIcon className="h-4 w-4" />
        )}
      </button>
    </div>
  </div>
);

export default function ChangePasswordForm() {
  const t = useTranslations("account");
  const { toast } = useToast();

  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [newPwd2, setNewPwd2] = useState("");
  const [loading, setLoading] = useState(false);

  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [show3, setShow3] = useState(false);

  const isValid =
    newPwd.length >= 8 && newPwd === newPwd2 && currentPwd.length > 0;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    setLoading(true);

    try {
      const res = await fetch("/api/account/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: currentPwd,
          newPassword: newPwd,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || t("password.changeFail"));

      toast({ description: t("password.changeSuccess"), variant: "success" });
      setCurrentPwd("");
      setNewPwd("");
      setNewPwd2("");
    } catch (e: unknown) {
      // [수정] any 제거 및 타입 가드 사용
      const message = e instanceof Error ? e.message : t("password.changeFail");
      toast({ description: message, variant: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    // [수정] 카드 컨테이너
    <div className="rounded-2xl shadow-xl overflow-hidden border transition-colors bg-white border-gray-200 [:root[data-theme=dark]_&]:bg-[#131B2D] [:root[data-theme=dark]_&]:border-gray-800">
      <div className="p-5 border-b flex items-center gap-2 transition-colors bg-gray-50 border-gray-200 [:root[data-theme=dark]_&]:bg-[#0B1222]/30 [:root[data-theme=dark]_&]:border-gray-800">
        <LockClosedIcon className="h-5 w-5 text-[#06b6d4]" />
        <h2 className="text-base font-bold text-gray-900 [:root[data-theme=dark]_&]:text-gray-200">
          {t("password.title")}
        </h2>
      </div>

      <div className="p-5">
        <form onSubmit={onSubmit} className="space-y-4 max-w-lg">
          <PwdInput
            label={t("password.current")}
            val={currentPwd}
            setVal={setCurrentPwd}
            show={show1}
            setShow={setShow1}
          />
          <PwdInput
            label={t("password.new")}
            val={newPwd}
            setVal={setNewPwd}
            show={show2}
            setShow={setShow2}
          />
          <PwdInput
            label={t("password.confirm")}
            val={newPwd2}
            setVal={setNewPwd2}
            show={show3}
            setShow={setShow3}
          />

          <button
            type="submit"
            className="btn btn-primary w-full bg-[#06b6d4] hover:bg-[#0891b2] border-none text-white mt-2 shadow-md shadow-cyan-500/20 [:root[data-theme=dark]_&]:shadow-cyan-900/20"
            disabled={!isValid || loading}
          >
            {loading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              t("password.changeBtn")
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
