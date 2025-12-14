// src/app/(site)/shared/gaurd/bot-list.ts
import type { BotStatus } from "@/app/[locale]/(site)/bot-config/types";

/** DB 원본 상태(단건 GET 등에서 내려오는 statusRaw) */
export type BotRawStatus = "STARTING" | "STOPPING" | "ERROR";

/** 컨트롤 판정에 사용하는 통합 상태 타입(UI + Raw) */
export type BotUiOrRawStatus = BotStatus | BotRawStatus;

/**
 * 상태 → 상단 "선택 시작/선택 종료" 버튼 활성화 규칙
 * - RUNNING:  종료만 활성
 * - STOPPED:  시작만 활성
 * - STARTING: 종료만 활성(시작 취소 개념)
 * - STOPPING: 시작만 활성(다시 시작 가능)
 * - ERROR:    시작만 활성(재시도)
 * - UNKNOWN:  둘 다 비활성
 */
export function controlsForStatus(status: BotUiOrRawStatus | undefined): {
  canStart: boolean;
  canStop: boolean;
} {
  switch (status) {
    case "RUNNING":
      return { canStart: false, canStop: true };
    case "STOPPED":
      return { canStart: true, canStop: false };
    case "STARTING":
      return { canStart: false, canStop: true };
    case "STOPPING":
      return { canStart: true, canStop: false };
    case "ERROR":
      return { canStart: true, canStop: false };
    case "UNKNOWN":
    default:
      return { canStart: false, canStop: false };
  }
}
