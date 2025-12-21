"use client";

import { SignupForm } from "./view/SignupForm";
import { useTranslations } from "next-intl";
import Image from "next/image";

// 환경변수에 따라 브랜드 확인
const BRAND = process.env.NEXT_PUBLIC_BRAND_NAME;

// 1. 브랜드에 따른 이미지 경로 설정
const bgImage =
  BRAND === "Quanty"
    ? "/Quantyloginbackground.jpg"
    : "/GlobXloginbackground.png";

// 2. [수정] 브랜드에 따른 박스 배경 투명도 설정
// Quanty: bg-black/70 (진하게)
// GlobX: bg-black/40 (기존 유지)
const boxBgClass = BRAND === "Quanty" ? "bg-black/70" : "bg-black/40";

export default function SignupPage() {
  const t = useTranslations("authSignup");

  return (
    // [1] 전체 컨테이너
    <div className="relative h-[calc(100dvh-4rem)] w-full flex items-center justify-center lg:justify-end overflow-hidden bg-black">
      {/* [2] 배경 이미지 */}
      <div className="absolute inset-0 z-0 hidden lg:block">
        <Image
          src={bgImage}
          alt="Signup Background"
          fill
          className="object-cover object-center"
          priority
        />
      </div>

      {/* [3] 회원가입 카드 컨테이너 */}
      <div className="relative z-10 w-full max-w-[420px] px-4 lg:mr-32 animate-in fade-in slide-in-from-right-8 duration-500">
        {/* [수정 적용] className에 boxBgClass 변수 적용
            기존: bg-black/40
            변경: ${boxBgClass}
        */}
        <div
          className={`w-full rounded-2xl border border-white/10 ${boxBgClass} shadow-2xl backdrop-blur-md flex flex-col max-h-[85vh]`}
        >
          {/* 헤더 */}
          <div className="p-8 pb-4 border-b border-white/5 shrink-0">
            <h1 className="text-2xl font-bold text-white">{t("title")}</h1>
            <p className="mt-2 text-sm text-gray-300">{t("subtitle")}</p>
          </div>

          {/* 폼 영역 */}
          <div className="p-8 pt-4 overflow-y-auto custom-scrollbar">
            <SignupForm />
          </div>
        </div>
      </div>

      {/* 스크롤바 디자인 */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.4);
        }
      `}</style>
    </div>
  );
}
