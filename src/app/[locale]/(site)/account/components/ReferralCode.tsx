"use client";

import React from "react";
import { ClipboardDocumentIcon, GiftIcon } from "@heroicons/react/24/outline";
import type { ReferralCodeProps } from "@/types/account/types";
import { useTranslations } from "next-intl";

export default function ReferralCode({ refLink, onCopy }: ReferralCodeProps) {
  const t = useTranslations("account");
  const hasLink = typeof refLink === "string" && refLink.length > 0;

  return (
    // [수정] 그라디언트 배경: 다크(#131B2D->#0B1222) / 라이트(white->gray-50)
    <div className="border rounded-2xl shadow-xl overflow-hidden relative group transition-colors border-gray-200 bg-gradient-to-r from-white to-gray-50 [:root[data-theme=dark]_&]:border-gray-800 [:root[data-theme=dark]_&]:from-[#131B2D] [:root[data-theme=dark]_&]:to-[#0B1222]">
      <div className="absolute -top-6 -right-6 p-4 opacity-20 pointer-events-none rotate-12 transition-transform group-hover:scale-110 duration-700">
        <GiftIcon className="w-40 h-40 text-[#06b6d4]" />
      </div>

      <div className="p-6 relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2 mb-2 text-gray-900 [:root[data-theme=dark]_&]:text-white">
            <GiftIcon className="h-5 w-5 text-[#06b6d4]" />
            {t("referral.title")}
          </h2>
          <p className="text-sm max-w-lg text-gray-600 [:root[data-theme=dark]_&]:text-gray-400">
            {t("referral.desc")}
          </p>
        </div>

        {/* [수정] 입력창 배경: 라이트(gray-100) / 다크(#0B1222) */}
        <div className="flex w-full md:w-auto items-center gap-2 p-2 rounded-xl border z-20 shadow-sm transition-colors bg-gray-100 border-gray-300 [:root[data-theme=dark]_&]:bg-[#0B1222] [:root[data-theme=dark]_&]:border-gray-700">
          <input
            type="text"
            value={hasLink ? refLink : "-"}
            readOnly
            className="bg-transparent border-none text-sm w-full md:w-64 px-2 focus:outline-none font-mono text-gray-700 [:root[data-theme=dark]_&]:text-gray-300"
          />
          <button
            type="button"
            className="btn btn-sm btn-primary bg-[#06b6d4] hover:bg-[#0891b2] border-none text-white shadow-lg shrink-0"
            onClick={onCopy}
            disabled={!hasLink}
          >
            <ClipboardDocumentIcon className="h-4 w-4" />
            <span className="hidden sm:inline ml-1">{t("action.copy")}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
