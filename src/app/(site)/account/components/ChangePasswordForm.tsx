// src/app/(site)/account/components/ChangePasswordForm.tsx
"use client";

import React, { useState, type FormEvent } from "react";
// ⬇️ PasswordRow 제거하고 PasswordField 사용
import {
  PasswordField,
  Card,
  Button,
  Badge,
  Form,
  Checklist,
} from "@/components/ui";
import { useToast } from "@/components/ui";

// 공용 타입
import type {
  ChangePasswordBody,
  ChangePasswordResponse,
} from "@/types/account/password/types";

export default function ChangePasswordForm() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showNew2, setShowNew2] = useState(false);

  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [newPwd2, setNewPwd2] = useState("");

  const { toast } = useToast();

  // 규칙 체크
  const pwLenOk = newPwd.length >= 8 && newPwd.length <= 18;
  const pwHasLetter = /[A-Za-z]/.test(newPwd);
  const pwHasDigit = /\d/.test(newPwd);
  const pwHasUpper = /[A-Z]/.test(newPwd);
  const pwHasSymbol = /[^A-Za-z0-9]/.test(newPwd);

  const newPwAllOk =
    pwLenOk && pwHasLetter && pwHasDigit && pwHasUpper && pwHasSymbol;

  const confirmOk = newPwd.length > 0 && newPwd === newPwd2;

  const canChangePwd =
    currentPwd.length > 0 && newPwAllOk && confirmOk && currentPwd !== newPwd;

  // 타입가드
  type ErrorResp = Extract<ChangePasswordResponse, { ok: false }>;
  type SuccessResp = Extract<ChangePasswordResponse, { ok: true }>;

  const isErrorResp = (v: unknown): v is ErrorResp => {
    if (typeof v !== "object" || v === null) return false;
    const r = v as Record<string, unknown>;
    return r.ok === false && typeof r.code === "string";
  };

  const isSuccessResp = (v: unknown): v is SuccessResp => {
    return (
      typeof v === "object" && v !== null && (v as { ok?: unknown }).ok === true
    );
  };

  const codeToMsg = (code?: string, fallback?: string): string => {
    switch (code) {
      case "UNAUTHORIZED":
        return "로그인이 필요합니다.";
      case "INVALID_INPUT":
        return "입력값이 올바르지 않습니다.";
      case "SAME_PASSWORD":
        return "새 비밀번호가 기존 비밀번호와 동일합니다.";
      case "NOT_FOUND":
        return "사용자 정보를 찾을 수 없습니다.";
      case "CURRENT_PASSWORD_INVALID":
        return "현재 비밀번호가 일치하지 않습니다.";
      case "POLICY_LENGTH":
        return "비밀번호 길이는 8~18자여야 합니다.";
      case "POLICY_LETTER":
        return "비밀번호에 영문자가 1자 이상 포함되어야 합니다.";
      case "POLICY_DIGIT":
        return "비밀번호에 숫자가 1자 이상 포함되어야 합니다.";
      case "POLICY_UPPER":
        return "비밀번호에 대문자가 1자 이상 포함되어야 합니다.";
      case "POLICY_SYMBOL":
        return "비밀번호에 기호가 1자 이상 포함되어야 합니다.";
      default:
        return fallback || "비밀번호 변경에 실패했습니다.";
    }
  };

  async function onSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    if (!canChangePwd) return;

    try {
      const body: ChangePasswordBody = {
        currentPassword: currentPwd,
        newPassword: newPwd,
      };

      const res = await fetch("/api/account/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify(body),
      });

      const raw: unknown = await res.json().catch(() => null);

      if (!res.ok || !isSuccessResp(raw)) {
        const errCode = isErrorResp(raw) ? raw.code : undefined;
        const errMsgFromServer = isErrorResp(raw) ? raw.message : undefined;
        const errMsg =
          codeToMsg(errCode, errMsgFromServer) ||
          `변경 실패 (HTTP ${res.status})`;
        toast({ variant: "error", description: errMsg });
        return;
      }

      // 성공 처리
      toast({ variant: "success", description: "비밀번호가 변경되었습니다." });

      setCurrentPwd("");
      setNewPwd("");
      setNewPwd2("");
      setShowCurrent(false);
      setShowNew(false);
      setShowNew2(false);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : typeof err === "string"
            ? err
            : "요청 처리 중 오류가 발생했습니다.";
      toast({ variant: "error", description: msg });
    }
  }

  return (
    <Card title="비밀번호 변경" actions={<Badge>보안</Badge>}>
      <Form onSubmit={onSubmit}>
        {/* 현재 비밀번호: autoComplete=current-password */}
        <PasswordField
          id="currentPwd"
          label="현재 비밀번호"
          value={currentPwd}
          onChange={setCurrentPwd}
          isNew={false}
          show={showCurrent}
          onShowChange={setShowCurrent}
        />

        {/* 새 비밀번호: autoComplete=new-password */}
        <PasswordField
          id="newPwd"
          label="새 비밀번호"
          value={newPwd}
          onChange={setNewPwd}
          isNew
          show={showNew}
          onShowChange={setShowNew}
          errorText={
            newPwd.length > 0 && !newPwAllOk
              ? "8~18자, 문자/숫자/대문자/기호 포함"
              : undefined
          }
        />

        {/* 새 비밀번호 확인 */}
        <PasswordField
          id="newPwd2"
          label="새 비밀번호 확인"
          value={newPwd2}
          onChange={setNewPwd2}
          isNew
          show={showNew2}
          onShowChange={setShowNew2}
          errorText={
            newPwd2.length > 0 && !confirmOk
              ? "비밀번호가 일치하지 않습니다."
              : undefined
          }
        />

        <Checklist
          items={[
            { text: "8~18 문자 길이", ok: pwLenOk },
            { text: "문자 포함", ok: pwHasLetter },
            { text: "숫자 포함", ok: pwHasDigit },
            { text: "대문자 1자 이상", ok: pwHasUpper },
            { text: "기호 1자 이상", ok: pwHasSymbol },
            ...(newPwd2.length > 0 && !confirmOk
              ? [{ text: "비밀번호가 일치하지 않습니다.", ok: false }]
              : []),
          ]}
        />

        <Button
          type="submit"
          disabled={!canChangePwd}
          className="w-full h-11 rounded-xl"
        >
          비밀번호 변경
        </Button>
      </Form>
    </Card>
  );
}
