// src/app/(site)/(home)/hooks/useAuthStatus.ts
"use client";

import { useEffect, useState } from "react";

/**
 * /api/bot-config/bots 엔드포인트의 HTTP 상태로 인증 여부 판단
 * - 401 → 비로그인
 * - 그 외 → 로그인으로 간주
 */
export function useAuthStatus(): { isAuthed: boolean; authChecked: boolean } {
  const [isAuthed, setIsAuthed] = useState<boolean>(false);
  const [authChecked, setAuthChecked] = useState<boolean>(false);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const res = await fetch("/api/bot-config/bots", { method: "GET" });
        if (!cancel) {
          setIsAuthed(res.status !== 401);
          setAuthChecked(true);
        }
      } catch {
        if (!cancel) {
          // 네트워크 오류 시 인증 불명 → 로그인 유도는 하지 않음
          setIsAuthed(true);
          setAuthChecked(true);
        }
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  return { isAuthed, authChecked };
}
