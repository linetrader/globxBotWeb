// src/app/[locale]/(site)/auth/login/page.tsx

"use client";

import { useCallback, useMemo, useState } from "react";
// [변경] 다국어 지원을 위해 @/i18n/routing에서 useRouter 가져오기
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl"; // [추가] 번역 훅
import {
  Button,
  InputField,
  LabeledField,
  Form,
  PasswordField,
} from "@/components/ui";
import { UserIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import type { LoginResponse } from "@/types/auth/login/types";
import { useToast } from "@/components/ui/feedback/Toast-provider";

// 파일 시스템에서 직접 가져온 이미지
import bgImage from "./loginbackground.png";
import Image from "next/image"; // 💡 [추가] Next/Image import

export default function Login() {
  const router = useRouter();
  const { toast } = useToast();
  // [추가] authLogin.json 네임스페이스 사용
  const t = useTranslations("authLogin");

  const [id, setId] = useState("");
  const [pwd, setPwd] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // 유효성 검사 로직
  const isEmail = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(id), [id]);
  const usernameOk = useMemo(() => /^[a-z0-9_]{4,16}$/.test(id), [id]);
  const idOk = isEmail || usernameOk;
  const pwOk = pwd.length > 0;
  const formValid = idOk && pwOk;

  const onSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setSubmitted(true);
      if (!formValid || loading) return;

      try {
        setLoading(true);
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: id.toLowerCase().trim(), password: pwd }),
        });
        const data = (await res.json()) as LoginResponse;

        if (res.ok && data.ok) {
          toast({
            title: t("messages.successTitle"), // "로그인 성공"
            // "OOO님, 환영합니다." (변수 치환)
            description: t("messages.successDesc", {
              username: data.user.username,
            }),
            variant: "success",
            position: "top-right",
            duration: 2000,
          });
          const params = new URLSearchParams(window.location.search);
          const next = params.get("next") ?? "/";
          router.replace(next);
          router.refresh();
          return;
        }

        if (!res.ok && !data.ok) {
          const msg =
            data.code === "INVALID_CREDENTIALS"
              ? t("messages.invalidCredentials")
              : data.code === "VALIDATION_ERROR"
                ? t("messages.validationError")
                : t("messages.generalError");
          toast({
            title: t("messages.failTitle"), // "로그인 실패"
            description: msg,
            variant: "error",
            position: "top-right",
            duration: 3500,
          });
        } else {
          toast({
            title: t("messages.serverErrorTitle"), // "서버 오류"
            description: t("messages.generalError"),
            variant: "error",
            position: "top-right",
            duration: 3500,
          });
        }
      } catch {
        toast({
          title: t("messages.networkErrorTitle"), // "네트워크 오류"
          description: t("messages.networkErrorDesc"),
          variant: "error",
          position: "top-right",
          duration: 3500,
        });
      } finally {
        setLoading(false);
      }
    },
    [formValid, loading, id, pwd, router, toast, t]
  );

  return (
    // [1] 전체 화면 컨테이너 (라이트: 흰색 / 다크: 검은색)
    <div
      className="relative w-full min-h-[calc(100dvh-4rem)] flex items-center justify-center lg:justify-end 
      bg-white [:root[data-theme=dark]_&]:bg-black transition-colors duration-300"
    >
      {/* 배경 이미지 섹션 (데스크탑에서만 보임) */}
      <div className="absolute inset-0 z-0 overflow-hidden hidden lg:block">
        {/* 💡 [수정] <img> 대신 <Image /> 사용 및 fill 속성 적용 */}
        <Image
          src={bgImage.src}
          alt="Login Background"
          fill // 부모 div 크기에 맞춤 (absolute inset-0이 부모)
          className="object-cover object-center"
          priority // LCP를 위해 우선 로드
        />
      </div>

      {/* [2] 로그인 박스 래퍼 */}
      <div className="relative z-10 w-full max-w-[420px] px-4 py-10 lg:mr-32 animate-in fade-in zoom-in duration-500">
        {/* [글래스모피즘 박스] 테마 적용 */}
        <div
          className="w-full rounded-2xl p-6 md:p-8 shadow-2xl backdrop-blur-md transition-colors duration-300
          bg-white border border-gray-200
          [:root[data-theme=dark]_&]:bg-black/40 [:root[data-theme=dark]_&]:border-white/10"
        >
          {/* 헤더 */}
          <div className="mb-6 md:mb-8">
            <h1
              className="text-xl md:text-2xl font-bold 
              text-gray-900 [:root[data-theme=dark]_&]:text-white"
            >
              {t("title")} {/* "로그인" */}
            </h1>
            <p
              className="mt-2 text-xs md:text-sm 
              text-gray-600 [:root[data-theme=dark]_&]:text-gray-300"
            >
              {t("subtitle")} {/* "서비스 이용을 위해 로그인이 필요합니다." */}
            </p>
          </div>

          <Form
            onSubmit={onSubmit}
            className="space-y-4 md:space-y-5"
            aria-busy={loading}
          >
            <div className="space-y-1">
              <LabeledField
                label={t("fields.idLabel")} // "아이디 또는 이메일"
                className="text-xs text-gray-600 [:root[data-theme=dark]_&]:text-gray-300"
                icon={
                  <UserIcon className="h-4 w-4 text-gray-500 [:root[data-theme=dark]_&]:text-gray-400" />
                }
              >
                <InputField
                  id="login-id"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  autoComplete="username"
                  placeholder={t("fields.idPlaceholder")} // "아이디 또는 이메일 입력"
                  disabled={loading}
                  // [입력창 스타일]
                  className="transition-colors duration-300
                    bg-white border-gray-300 text-gray-900 placeholder:text-gray-400
                    focus:border-[#06b6d4] focus:ring-[#06b6d4]
                    [:root[data-theme=dark]_&]:bg-black/30 [:root[data-theme=dark]_&]:border-white/20 [:root[data-theme=dark]_&]:text-white [:root[data-theme=dark]_&]:placeholder:text-gray-500"
                  errorText={
                    submitted && !idOk
                      ? t("fields.idError") // "아이디/이메일 형식을 확인해 주세요."
                      : undefined
                  }
                />
              </LabeledField>
            </div>

            <div className="space-y-1">
              <LabeledField
                label={t("fields.pwLabel")} // "패스워드"
                className="text-xs text-gray-600 [:root[data-theme=dark]_&]:text-gray-300"
                icon={
                  <LockClosedIcon className="h-4 w-4 text-gray-500 [:root[data-theme=dark]_&]:text-gray-400" />
                }
              >
                <div
                  className="w-full 
                  [&_input]:transition-colors [&_input]:duration-300
                  [&_input]:bg-white [&_input]:border-gray-300 [&_input]:text-gray-900 [&_input]:placeholder:text-gray-400 [&_input]:rounded-xl
                  [&_input]:focus:border-[#06b6d4] [&_input]:focus:ring-[#06b6d4]
                  [:root[data-theme=dark]_&_input]:bg-black/30 [:root[data-theme=dark]_&_input]:border-white/20 [:root[data-theme=dark]_&_input]:text-white [:root[data-theme=dark]_&_input]:placeholder:text-gray-500"
                >
                  <PasswordField
                    id="login-password"
                    value={pwd}
                    onChange={setPwd}
                    placeholder={t("fields.pwPlaceholder")} // "비밀번호 입력"
                    disabled={loading}
                    errorText={
                      submitted && !pwOk
                        ? t("fields.pwError") // "비밀번호를 입력해 주세요."
                        : undefined
                    }
                  />
                </div>
              </LabeledField>
            </div>

            <div className="pt-2">
              <Button
                className="h-11 w-full rounded-xl text-base font-medium text-white shadow-lg transition-all
                  bg-[#06b6d4] hover:bg-[#0891b2] border-none"
                type="submit"
                disabled={loading || (submitted && !formValid)}
              >
                {loading ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  t("buttons.submit") // "로그인"
                )}
              </Button>
            </div>

            <div
              className="mt-4 flex justify-center text-xs gap-4
              text-gray-500 [:root[data-theme=dark]_&]:text-gray-400"
            >
              <button
                type="button"
                className="hover:text-black [:root[data-theme=dark]_&]:hover:text-white transition-colors"
                onClick={() => router.push("/auth/find-id")}
              >
                {t("buttons.findId")} {/* "아이디 찾기" */}
              </button>

              <span
                className="w-px h-3 my-auto 
                bg-gray-300 [:root[data-theme=dark]_&]:bg-gray-600"
              />

              <button
                type="button"
                className="hover:text-black [:root[data-theme=dark]_&]:hover:text-white transition-colors"
                onClick={() => router.push("/auth/find-password")}
              >
                {t("buttons.findPw")} {/* "비밀번호 찾기" */}
              </button>

              <span
                className="w-px h-3 my-auto 
                bg-gray-300 [:root[data-theme=dark]_&]:bg-gray-600"
              />

              <button
                type="button"
                className="hover:text-[#06b6d4] transition-colors font-medium"
                onClick={() => router.push("/auth/signup")}
              >
                {t("buttons.signup")} {/* "회원가입" */}
              </button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
