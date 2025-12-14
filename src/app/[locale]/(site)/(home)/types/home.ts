// src/app/[locale]/(site)/(home)/types/home.ts (파일 위치가 변경되었다고 가정)

// [수정] BotRow와 BotStatus를 가져오는 경로에 [locale] 추가
import type { BotRow, BotStatus } from "@/app/[locale]/(site)/bot-config/types";

/** 단건 상세(백엔드 GET /api/bot-config/bots/[id]) 응답 데이터 */
export type BotRawStatus = "STARTING" | "STOPPING" | "ERROR";
export type BotDetail = BotRow & {
  /** 백엔드가 내려주는 원시 상태(선택적) */
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
