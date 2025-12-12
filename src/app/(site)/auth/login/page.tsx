// app/auth/login/page.tsx
"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  Button,
  InputField,
  LabeledField,
  Section,
  Form,
  PasswordField, // ← 추가
} from "@/components/ui";
import { UserIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import type { LoginResponse } from "@/types/auth/login/types";
import { useToast } from "@/components/ui/feedback/Toast-provider";

export default function Login() {
  const router = useRouter();
  const { toast } = useToast();

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
            title: "로그인 성공",
            description: `${data.user.username}님, 환영합니다.`,
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
              ? "아이디(또는 이메일) 또는 비밀번호가 올바르지 않습니다."
              : data.code === "VALIDATION_ERROR"
                ? "입력값을 다시 확인해 주세요."
                : "일시적인 문제로 로그인할 수 없습니다.";
          toast({
            title: "로그인 실패",
            description: msg,
            variant: "error",
            position: "top-right",
            duration: 3500,
          });
        } else {
          toast({
            title: "서버 오류",
            description: "일시적인 문제로 로그인할 수 없습니다.",
            variant: "error",
            position: "top-right",
          });
        }
      } catch {
        toast({
          title: "네트워크 오류",
          description: "인터넷 연결을 확인하고 다시 시도해 주세요.",
          variant: "error",
          position: "top-right",
        });
      } finally {
        setLoading(false);
      }
    },
    [formValid, loading, id, pwd, router, toast]
  );

  return (
    <Section className="mx-auto max-w-screen-sm px-4 pt-4 pb-24">
      <Card title="로그인" variant="default" shadow="md">
        <Card>
          <Form onSubmit={onSubmit} className="space-y-4" aria-busy={loading}>
            <LabeledField
              icon={<UserIcon className="h-4 w-4" />}
              label="아이디 또는 이메일"
            >
              <InputField
                id="login-id"
                value={id}
                onChange={(e) => setId(e.target.value)}
                autoComplete="username"
                placeholder="아이디(소문자/숫자/밑줄 4~16) 또는 이메일"
                disabled={loading}
                errorText={
                  submitted && !idOk
                    ? "아이디/이메일 형식을 확인해 주세요."
                    : undefined
                }
              />
            </LabeledField>

            <LabeledField
              icon={<LockClosedIcon className="h-4 w-4" />}
              label="패스워드"
            >
              {/* ⬇️ PasswordField로 교체 (비제어 show) */}
              <PasswordField
                id="login-password"
                value={pwd}
                onChange={setPwd}
                placeholder="비밀번호를 입력하세요"
                disabled={loading}
                // isNew 생략 → current-password 자동 적용
                errorText={
                  submitted && !pwOk ? "비밀번호를 입력해 주세요." : undefined
                }
              />
            </LabeledField>

            <Button
              className="h-11 w-full rounded-xl"
              type="submit"
              disabled={loading || (submitted && !formValid)}
            >
              {loading ? "처리 중..." : "로그인"}
            </Button>
          </Form>
        </Card>
      </Card>
    </Section>
  );
}
