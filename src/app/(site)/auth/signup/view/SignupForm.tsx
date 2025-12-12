"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/feedback/Toast-provider";

import { useSignupValidation } from "@/app/(site)/auth/signup/hooks/useSignupValidation";
import { signup } from "@/app/(site)/auth/signup/utils/api";

import { TopPart } from "./TopPart";
import { MiddlePart } from "./MiddlePart";
import { RowPart } from "./RowPart";
import { Agreements } from "./Agreements";
import { SubmitBar } from "./SubmitBar";

import type {
  FormState,
  TopPartErrorText,
  RowPartErrorText,
} from "@/app/(site)/auth/signup/types/signup/form";
import { COUNTRY_OPTIONS } from "@/app/(site)/auth/signup/types/signup/enums";
import type {
  SignupError,
  SignupResponse,
} from "@/app/(site)/auth/signup/types/signup/api";

export function SignupForm() {
  const [f, setF] = useState<FormState>({
    username: "",
    email: "",
    password: "",
    password2: "",
    name: "",
    referrer: "",
    sponsor: "",
    countryCode: "",
    agreeTerms: false,
    agreePrivacy: false,
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [serverUsernameError, setServerUsernameError] = useState<
    string | undefined
  >();
  const [serverEmailError, setServerEmailError] = useState<
    string | undefined
  >();
  const [serverRefError, setServerRefError] = useState<string | undefined>();
  const [serverCountryError, setServerCountryError] = useState<
    string | undefined
  >();
  const [serverGeneralError, setServerGeneralError] = useState<
    string | undefined
  >();

  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const fromUrl = (searchParams.get("ref") || "").trim();
    if (!fromUrl) return;
    setF((prev) => (prev.referrer ? prev : { ...prev, referrer: fromUrl }));
  }, [searchParams]);

  const v = useSignupValidation(f, COUNTRY_OPTIONS);

  const formValid =
    v.usernameOk &&
    v.emailOk &&
    v.pwAllOk &&
    v.confirmOk &&
    v.nameOk &&
    v.agreementsOk &&
    v.countryCodeOk;

  function set<K extends keyof FormState>(key: K, val: FormState[K]): void {
    setF((prev) => ({ ...prev, [key]: val }));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setSubmitted(true);
    setServerUsernameError(undefined);
    setServerEmailError(undefined);
    setServerRefError(undefined);
    setServerCountryError(undefined);
    setServerGeneralError(undefined);

    if (!formValid || loading) {
      toast({
        title: "입력값 오류",
        description: "필수 항목과 형식을 확인해 주세요.",
        variant: "error",
        position: "top-right",
        duration: 2500,
      });
      return;
    }

    try {
      setLoading(true);
      const res: SignupResponse = await signup({
        username: f.username.toLowerCase().trim(),
        email: f.email.toLowerCase().trim(),
        password: f.password,
        name: f.name.trim(),
        referrer: f.referrer || null,
        sponsor: f.sponsor || null,
        countryCode: f.countryCode || null,
        agreeTerms: f.agreeTerms,
        agreePrivacy: f.agreePrivacy,
      });

      if (res.ok) {
        toast({
          title: "회원가입 완료",
          description: "이메일/아이디로 로그인해 주세요.",
          variant: "success",
          position: "top-right",
          duration: 2200,
        });
        router.push("/auth/login");
        return;
      }

      const code: SignupError | undefined = res.code;
      switch (code) {
        case "USERNAME_TAKEN":
          setServerUsernameError("이미 사용 중인 아이디입니다.");
          break;
        case "EMAIL_TAKEN":
          setServerEmailError("이미 사용 중인 이메일입니다.");
          break;
        case "REFERRER_NOT_FOUND":
          setServerRefError("추천인을 찾을 수 없습니다.");
          break;
        case "SPONSOR_NOT_FOUND":
          setServerGeneralError("후원인을 찾을 수 없습니다.");
          break;
        case "COUNTRY_CODE_INVALID":
          setServerCountryError(
            "국가 코드는 영문 2글자여야 합니다. (예: KR, US)"
          );
          break;
        case "COUNTRY_NOT_FOUND":
          setServerCountryError("해당 국가 코드를 찾을 수 없습니다.");
          break;
        default:
          setServerGeneralError("입력값을 다시 확인해 주세요.");
      }

      toast({
        title: code ? "회원가입 실패" : "입력값 오류",
        description: "입력값을 다시 확인해 주세요.",
        variant: "error", // destructive → error
        position: "top-right",
      });
    } catch {
      setServerGeneralError("서버/네트워크 오류가 발생했습니다.");
      toast({
        title: "오류",
        description: "일시적인 문제로 처리할 수 없습니다.",
        variant: "error",
        position: "top-right",
      });
    } finally {
      setLoading(false);
    }
  }

  const topErrorText: TopPartErrorText | undefined = useMemo(() => {
    const usernameErr =
      serverUsernameError ??
      (submitted && !v.usernameOk ? "아이디 형식을 확인해 주세요." : undefined);
    const emailErr =
      serverEmailError ??
      (submitted && !v.emailOk ? "이메일 형식을 확인해 주세요." : undefined);
    if (usernameErr || emailErr) {
      return { username: usernameErr ?? "", email: emailErr ?? "" };
    }
    return undefined;
  }, [
    serverUsernameError,
    serverEmailError,
    submitted,
    v.usernameOk,
    v.emailOk,
  ]);

  const rowErrorText: RowPartErrorText | undefined = useMemo(() => {
    const nameErr =
      submitted && !v.nameOk ? "닉네임을 입력해 주세요." : undefined;
    const ccErr =
      serverCountryError ??
      (submitted && !v.countryCodeOk
        ? "국가 코드를 선택해 주세요."
        : undefined);
    const refErr = serverRefError;

    if (nameErr || ccErr || refErr) {
      return {
        name: nameErr ?? "",
        countryCode: ccErr ?? "",
        ref: refErr ?? "",
      };
    }
    return undefined;
  }, [
    serverCountryError,
    serverRefError,
    submitted,
    v.nameOk,
    v.countryCodeOk,
  ]);

  return (
    <section className="mx-auto max-w-screen-sm px-4 pt-4 pb-24">
      {serverGeneralError ? (
        <div className="mb-3 text-sm text-error px-1">{serverGeneralError}</div>
      ) : null}

      <div className="card bg-base-100 shadow-md">
        <div className="card-body">
          <h2 className="card-title">회원가입</h2>

          <form onSubmit={onSubmit} aria-busy={loading}>
            <TopPart
              value={{ username: f.username, email: f.email }}
              onChange={(next) => {
                setF((prev) => ({
                  ...prev,
                  username: next.username,
                  email: next.email,
                }));
                if (next.username !== f.username)
                  setServerUsernameError(undefined);
                if (next.email !== f.email) setServerEmailError(undefined);
              }}
              disabled={loading}
              errorText={topErrorText}
            />

            <MiddlePart
              password={f.password}
              password2={f.password2}
              onPasswordChange={(v) => set("password", v)}
              onPassword2Change={(v) => set("password2", v)}
              disabled={loading}
              checklist={{
                len: v.pwLenOk,
                letter: v.pwHasLetter,
                digit: v.pwHasDigit,
                upper: v.pwHasUpper,
                symbol: v.pwHasSymbol,
                confirmShown: f.password2.length > 0,
                confirmOk: v.confirmOk,
              }}
            />

            <RowPart
              value={{
                name: f.name,
                countryCode: f.countryCode,
                ref: f.referrer,
              }}
              onChange={(next) => {
                setF((prev) => ({
                  ...prev,
                  name: next.name,
                  countryCode: next.countryCode,
                  referrer: next.ref,
                }));
                if (next.countryCode !== f.countryCode)
                  setServerCountryError(undefined);
                if (next.ref !== f.referrer) setServerRefError(undefined);
              }}
              disabled={loading}
              errorText={rowErrorText}
              options={COUNTRY_OPTIONS}
            />

            <Agreements
              agreeTerms={f.agreeTerms}
              agreePrivacy={f.agreePrivacy}
              onChangeTerms={(b) => set("agreeTerms", b)}
              onChangePrivacy={(b) => set("agreePrivacy", b)}
              submitted={submitted}
              disabled={loading}
              agreementsOk={v.agreementsOk}
            />

            <SubmitBar loading={loading} disabled={!formValid && submitted} />
          </form>
        </div>
      </div>
    </section>
  );
}
