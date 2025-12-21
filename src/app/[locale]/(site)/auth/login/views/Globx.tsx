"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
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
import Image from "next/image";

export function GlobxView() {
  const router = useRouter();
  const { toast } = useToast();
  // GlobX 네임스페이스 사용
  const t = useTranslations("authLogin.GlobX");

  const [id, setId] = useState("");
  const [pwd, setPwd] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

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
            title: t("messages.successTitle"),
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
            title: t("messages.failTitle"),
            description: msg,
            variant: "error",
            position: "top-right",
            duration: 3500,
          });
        } else {
          toast({
            title: t("messages.serverErrorTitle"),
            description: t("messages.generalError"),
            variant: "error",
            position: "top-right",
            duration: 3500,
          });
        }
      } catch {
        toast({
          title: t("messages.networkErrorTitle"),
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
    <div className="relative w-full min-h-[calc(100dvh-4rem)] flex items-center justify-center lg:justify-end bg-white [:root[data-theme=dark]_&]:bg-black transition-colors duration-300">
      <div className="absolute inset-0 z-0 overflow-hidden hidden lg:block">
        {/* GlobX 배경 이미지 경로 변경: /GlobXloginbackground.png */}
        <Image
          src="/GlobXloginbackground.png"
          alt="GlobX Login Background"
          fill
          className="object-cover object-center"
          priority
        />
      </div>

      <div className="relative z-10 w-full max-w-[420px] px-4 py-10 lg:mr-32 animate-in fade-in zoom-in duration-500">
        <div className="w-full rounded-2xl p-6 md:p-8 shadow-2xl backdrop-blur-md transition-colors duration-300 bg-white border border-gray-200 [:root[data-theme=dark]_&]:bg-black/40 [:root[data-theme=dark]_&]:border-white/10">
          <div className="mb-6 md:mb-8">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 [:root[data-theme=dark]_&]:text-white">
              {t("title")}
            </h1>
            <p className="mt-2 text-xs md:text-sm text-gray-600 [:root[data-theme=dark]_&]:text-gray-300">
              {t("subtitle")}
            </p>
          </div>

          <Form
            onSubmit={onSubmit}
            className="space-y-4 md:space-y-5"
            aria-busy={loading}
          >
            <div className="space-y-1">
              <LabeledField
                label={t("fields.idLabel")}
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
                  placeholder={t("fields.idPlaceholder")}
                  disabled={loading}
                  className="transition-colors duration-300 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-[#06b6d4] focus:ring-[#06b6d4] [:root[data-theme=dark]_&]:bg-black/30 [:root[data-theme=dark]_&]:border-white/20 [:root[data-theme=dark]_&]:text-white [:root[data-theme=dark]_&]:placeholder:text-gray-500"
                  errorText={
                    submitted && !idOk ? t("fields.idError") : undefined
                  }
                />
              </LabeledField>
            </div>

            <div className="space-y-1">
              <LabeledField
                label={t("fields.pwLabel")}
                className="text-xs text-gray-600 [:root[data-theme=dark]_&]:text-gray-300"
                icon={
                  <LockClosedIcon className="h-4 w-4 text-gray-500 [:root[data-theme=dark]_&]:text-gray-400" />
                }
              >
                <div className="w-full [&_input]:transition-colors [&_input]:duration-300 [&_input]:bg-white [&_input]:border-gray-300 [&_input]:text-gray-900 [&_input]:placeholder:text-gray-400 [&_input]:rounded-xl [&_input]:focus:border-[#06b6d4] [&_input]:focus:ring-[#06b6d4] [:root[data-theme=dark]_&_input]:bg-black/30 [:root[data-theme=dark]_&_input]:border-white/20 [:root[data-theme=dark]_&_input]:text-white [:root[data-theme=dark]_&_input]:placeholder:text-gray-500">
                  <PasswordField
                    id="login-password"
                    value={pwd}
                    onChange={setPwd}
                    placeholder={t("fields.pwPlaceholder")}
                    disabled={loading}
                    errorText={
                      submitted && !pwOk ? t("fields.pwError") : undefined
                    }
                  />
                </div>
              </LabeledField>
            </div>

            <div className="pt-2">
              <Button
                className="h-11 w-full rounded-xl text-base font-medium text-white shadow-lg transition-all bg-[#06b6d4] hover:bg-[#0891b2] border-none"
                type="submit"
                disabled={loading || (submitted && !formValid)}
              >
                {loading ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  t("buttons.submit")
                )}
              </Button>
            </div>

            <div className="mt-4 flex justify-center text-xs gap-4 text-gray-500 [:root[data-theme=dark]_&]:text-gray-400">
              <button
                type="button"
                className="hover:text-black [:root[data-theme=dark]_&]:hover:text-white transition-colors"
                onClick={() => router.push("/auth/find-id")}
              >
                {t("buttons.findId")}
              </button>
              <span className="w-px h-3 my-auto bg-gray-300 [:root[data-theme=dark]_&]:bg-gray-600" />
              <button
                type="button"
                className="hover:text-black [:root[data-theme=dark]_&]:hover:text-white transition-colors"
                onClick={() => router.push("/auth/find-password")}
              >
                {t("buttons.findPw")}
              </button>
              <span className="w-px h-3 my-auto bg-gray-300 [:root[data-theme=dark]_&]:bg-gray-600" />
              <button
                type="button"
                className="hover:text-[#06b6d4] transition-colors font-medium"
                onClick={() => router.push("/auth/signup")}
              >
                {t("buttons.signup")}
              </button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
