// src/server/botRuntimeService.ts
import { BotStatus } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";

// 러닝이라고 간주할 수 있는 heartbeat 유효 기간(초)
const STALE_SECONDS = 15;

// ---- debug helpers ----
const RUNTIME_DEBUG: boolean = (() => {
  const v = process.env.BOT_RUNTIME_DEBUG;
  if (!v) return false;
  const s = v.trim().toLowerCase();
  return s === "1" || s === "true" || s === "yes" || s === "y" || s === "on";
})();

function dbg(label: string, fields: Record<string, unknown>): void {
  if (!RUNTIME_DEBUG) return;
  const ts = new Date().toISOString();
  try {
    console.log(`[bot-runtime] ${label} ${ts} ${JSON.stringify(fields)}`);
  } catch {
    console.log(`[bot-runtime] ${label} ${ts}`, fields);
  }
}

function isHeartbeatFresh(
  lastHeartbeat: Date | null | undefined,
  staleSeconds: number
): boolean {
  if (!lastHeartbeat) return false;
  const nowMs = Date.now();
  const hbMs = lastHeartbeat.getTime();
  const diffSec = (nowMs - hbMs) / 1000;
  return diffSec <= staleSeconds;
}

/**
 * 현재 BotRuntime 상태만 읽어온다.
 * 런타임 row 가 없으면 null.
 */
export async function getBotRuntimeStatus(
  botId: string
): Promise<BotStatus | null> {
  const row = await prisma.botRuntime.findUnique({
    where: { botId },
    select: { status: true },
  });
  const status: BotStatus | null = row?.status ?? null;
  dbg("STATUS_READ", { botId, status });
  return status;
}

/**
 * 현재 실행 중(RUNNING + 유효 heartbeat + workerId 존재)인지 판별.
 */
export async function isBotCurrentlyRunning(botId: string): Promise<boolean> {
  const runtimeRow = await prisma.botRuntime.findUnique({
    where: { botId },
    select: {
      status: true,
      workerId: true,
      lastHeartbeat: true,
    },
  });

  if (!runtimeRow) {
    dbg("RUNNING_CHECK", { botId, running: false, reason: "NO_ROW" });
    return false;
  }
  if (runtimeRow.status !== BotStatus.RUNNING) {
    dbg("RUNNING_CHECK", {
      botId,
      running: false,
      reason: "STATUS_NOT_RUNNING",
      status: runtimeRow.status,
    });
    return false;
  }
  if (!runtimeRow.workerId) {
    dbg("RUNNING_CHECK", { botId, running: false, reason: "NO_WORKER" });
    return false;
  }
  if (!isHeartbeatFresh(runtimeRow.lastHeartbeat, STALE_SECONDS)) {
    dbg("RUNNING_CHECK", {
      botId,
      running: false,
      reason: "STALE_HEARTBEAT",
      lastHeartbeat: runtimeRow.lastHeartbeat?.toISOString() ?? null,
      staleSeconds: STALE_SECONDS,
    });
    return false;
  }

  dbg("RUNNING_CHECK", { botId, running: true });
  return true;
}

/**
 * START 큐잉 허용 여부 판단.
 * 정책(완화):
 *  - 허용: status ∈ { null, STOPPED, STOPPING, ERROR }
 *  - 거부: status ∈ { STARTING, RUNNING }
 */
export async function isStartQueuingAllowed(botId: string): Promise<{
  allowed: boolean;
  status: BotStatus | null;
  reason: string | null;
}> {
  const status = await getBotRuntimeStatus(botId);

  // 허용 집합
  const allowedSet: ReadonlySet<BotStatus | null> = new Set<BotStatus | null>([
    null,
    BotStatus.STOPPED,
    BotStatus.STOPPING,
    BotStatus.ERROR,
  ]);

  if (allowedSet.has(status)) {
    dbg("START_ALLOWED", { botId, status, reason: null });
    return { allowed: true, status, reason: null };
  }

  // STARTING/RUNNING 은 차단
  dbg("START_BLOCKED", { botId, status, reason: "NOT_ALLOWED_STATE" });
  return { allowed: false, status, reason: "NOT_ALLOWED_STATE" };
}
