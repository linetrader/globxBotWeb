// src/app/(site)/shared/types/bot-list.ts
import type { BotRow, BotStatus } from "@/app/(site)/bot-config/types";

export type BotListButtons = {
  canStartSelected: boolean;
  canStopSelected: boolean;
};

export type BotListProps = {
  title: string;

  bots: BotRow[];
  loading: boolean;
  error?: string;

  selectedBotId: string | null;
  deletingId: string | null;

  // 상단 버튼 액션(선택 봇 기준)
  onStartSelected: () => Promise<void>;
  onStopSelected: () => Promise<void>;

  // 행별 액션
  onStartBot: (id: string) => Promise<void>;
  onStopBot: (id: string) => Promise<void>;

  // 선택/갱신/삭제
  onSelect: (id: string | null) => void;
  onReload: () => Promise<void>;
  onDeleteSelected: () => Promise<void>;

  // 선택된 봇의 상태(상단 버튼 활성화 계산용)
  selectedStatus?: BotStatus;
};
