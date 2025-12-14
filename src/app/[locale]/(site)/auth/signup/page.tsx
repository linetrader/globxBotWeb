// src/app/[locale]/(site)/auth/signup/page.tsx

"use client";

import { SignupForm } from "./view/SignupForm";
import { useTranslations } from "next-intl";
import Image from "next/image"; // 💡 [추가] Next/Image import

// 로그인 폴더의 이미지를 참조 (직접 import 방식 유지)
import bgImage from "../login/loginbackground.png";

export default function SignupPage() {
  // [추가] 'authSignup' 네임스페이스 사용
  const t = useTranslations("authSignup");

  return (
    // [1] 전체 컨테이너 (화면 전체 높이 고정)
    // bg-black: 이미지가 숨겨졌을 때 보여질 기본 검은 배경
    <div className="relative h-[calc(100dvh-4rem)] w-full flex items-center justify-center lg:justify-end overflow-hidden bg-black">
      {/* [2] 배경 이미지 */}
      {/* [핵심 수정] hidden lg:block 추가
          - hidden: 기본(모바일)에서는 이미지를 숨김 -> 검은 배경만 보임
          - lg:block: PC(lg 사이즈 이상)에서는 이미지를 보이게 함
      */}
      <div className="absolute inset-0 z-0 hidden lg:block">
        {/* 💡 [수정] <img> 대신 <Image /> 사용 및 fill 속성 적용 */}
        <Image
          src={bgImage.src}
          alt="Signup Background"
          fill // 부모 div 크기에 맞춤 (absolute inset-0이 부모)
          // object-cover: PC에서는 꽉 차게 표시
          className="object-cover object-center"
          priority // LCP 개선을 위해 우선 로드
        />
      </div>

      {/* [3] 회원가입 카드 컨테이너 */}
      {/* max-w-[420px], lg:mr-32: 로그인 페이지와 위치/크기 동일하게 유지 */}
      <div className="relative z-10 w-full max-w-[420px] px-4 lg:mr-32 animate-in fade-in slide-in-from-right-8 duration-500">
        {/* 글래스모피즘 박스 (내부 스크롤 적용) */}
        {/* max-h-[85vh]: 화면 높이의 85%까지만 차지 (넘치면 내부 스크롤) */}
        <div className="w-full rounded-2xl border border-white/10 bg-black/40 shadow-2xl backdrop-blur-md flex flex-col max-h-[85vh]">
          {/* 헤더 (고정 영역) */}
          <div className="p-8 pb-4 border-b border-white/5 shrink-0">
            {/* [수정] 다국어 적용: "회원가입" -> t("title") */}
            <h1 className="text-2xl font-bold text-white">{t("title")}</h1>
            {/* [수정] 다국어 적용: "새로운 계정을..." -> t("subtitle") */}
            <p className="mt-2 text-sm text-gray-300">{t("subtitle")}</p>
          </div>

          {/* 폼 영역 (스크롤 영역) */}
          <div className="p-8 pt-4 overflow-y-auto custom-scrollbar">
            <SignupForm />
          </div>
        </div>
      </div>

      {/* 스크롤바 디자인 (크롬, 사파리 등) */}
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
