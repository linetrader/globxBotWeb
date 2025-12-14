"use client";

import React from "react";
import { AccountInfoProps } from "@/types/account/types";
import { useTranslations } from "next-intl";
import { IdentificationIcon } from "@heroicons/react/24/outline";

export default function AccountInfoForm({
  username,
  email,
  name,
  countryLabel,
}: AccountInfoProps) {
  const t = useTranslations("account");

  // [수정] 아이템 스타일
  const itemClass =
    "p-4 rounded-xl border flex flex-col gap-1 transition-colors " +
    "bg-gray-50 border-gray-200 " +
    "[:root[data-theme=dark]_&]:bg-[#0B1222] [:root[data-theme=dark]_&]:border-gray-800";

  const labelClass =
    "text-xs font-medium uppercase tracking-wider text-gray-500 [:root[data-theme=dark]_&]:text-gray-500";

  const valueClass =
    "text-sm font-mono break-all text-gray-800 [:root[data-theme=dark]_&]:text-gray-200";

  return (
    // [수정] 카드 컨테이너
    <div className="rounded-2xl shadow-xl overflow-hidden border transition-colors bg-white border-gray-200 [:root[data-theme=dark]_&]:bg-[#131B2D] [:root[data-theme=dark]_&]:border-gray-800">
      <div className="p-5 border-b flex items-center gap-2 transition-colors bg-gray-50 border-gray-200 [:root[data-theme=dark]_&]:bg-[#0B1222]/30 [:root[data-theme=dark]_&]:border-gray-800">
        <IdentificationIcon className="h-5 w-5 text-[#06b6d4]" />
        <h2 className="text-base font-bold text-gray-900 [:root[data-theme=dark]_&]:text-gray-200">
          {t("info.title")}
        </h2>
      </div>

      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={itemClass}>
          <span className={labelClass}>{t("info.username")}</span>
          <span className={valueClass}>{username || "-"}</span>
        </div>
        <div className={itemClass}>
          <span className={labelClass}>{t("info.email")}</span>
          <span className={valueClass}>{email || "-"}</span>
        </div>
        <div className={itemClass}>
          <span className={labelClass}>{t("info.name")}</span>
          <span className="text-sm font-medium text-gray-800 [:root[data-theme=dark]_&]:text-gray-200">
            {name || "-"}
          </span>
        </div>
        <div className={itemClass}>
          <span className={labelClass}>{t("info.country")}</span>
          <span className="text-sm font-medium text-gray-800 [:root[data-theme=dark]_&]:text-gray-200">
            {countryLabel || "-"}
          </span>
        </div>
      </div>
    </div>
  );
}
