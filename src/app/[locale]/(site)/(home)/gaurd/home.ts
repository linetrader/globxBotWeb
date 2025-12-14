// src/app/[locale]/(site)/(home)/types/home.ts
// [수정] BotRow와 BotStatus를 가져오는 경로에 [locale] 추가
import type { BotRow, BotStatus } from "@/app/[locale]/(site)/bot-config/types";

/** 개별 버튼 활성화 상태 */
export type ButtonState = {
  canStart: boolean;
  canStop: boolean;
};

/** 단건 상세(백엔드 GET /api/bot-config/bots/[id]) 응답 데이터 확장 */
export type BotRawStatus = "STARTING" | "STOPPING" | "ERROR";
export type BotDetail = BotRow & {
  statusRaw?: BotRawStatus;
};

/** 홈 화면 훅 반환 타입 */
export type HomeViewState = {
  isAuthed: boolean;
  authChecked: boolean;

  bots: BotRow[];
  loadingBots: boolean;
  botsError?: string;

  selected: {
    selectedBotId: string | null;
    selectedBot?: BotRow;
    selectedStatus?: BotStatus;
  };
  setSelectedBotId: (id: string | null) => void;

  startBot: (id: string) => Promise<void> | void;
  stopBot: (id: string) => Promise<void> | void;

  /** 목록 재조회 */
  reload: () => Promise<void>;

  /** 단건 조회(상태 포함) */
  getBotById: (id: string) => Promise<BotDetail | null>;
};
