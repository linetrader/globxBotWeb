// src/app/(site)/shared/types/bot-status-watcher.ts
import type { BotStatus } from "@/app/(site)/bot-config/types";

export type TargetStatus = Extract<BotStatus, "RUNNING" | "STOPPED">;

export type WaitOptions = {
  intervalMs: number; // 폴링 간격
  timeoutMs: number; // 타임아웃
};

export type WaitResult = {
  ok: boolean;
  status?: TargetStatus;
  reason?: "timeout" | "notfound";
};

export type UseBotStatusWatcherReturn = {
  pendingId: string | null;
  pendingAction: "start" | "stop" | null;
  startAndWait: (
    id: string,
    opts?: Partial<WaitOptions>
  ) => Promise<WaitResult>;
  stopAndWait: (id: string, opts?: Partial<WaitOptions>) => Promise<WaitResult>;
};
