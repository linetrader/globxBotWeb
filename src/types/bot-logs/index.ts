// strict 모드 가정, any 금지
import type { LogLevel } from "@/generated/prisma";

export type BotLogItem = {
  id: string;
  botId: string;
  level: LogLevel;
  message: string;
  createdAt: string; // ISO
};

export type BotLogListResponse = {
  ok: true;
  items: BotLogItem[];
  nextCursor: { cursorTs: string; cursorId: string } | null;
};

export type BotLogListQuery = {
  botId?: string;
  level?: LogLevel;
  limit?: number; // 기본 50
  cursorTs?: string; // ISO (createdAt)
  cursorId?: string; // 마지막 행 id
};
