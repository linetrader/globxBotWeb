// src/app/api/(site)/bot-control/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { getUserId } from "@/lib/request-user";
import { controlBots } from "@/server/botControlService";
import {
  isBotCurrentlyRunning,
  getBotRuntimeStatus,
} from "@/server/botRuntimeService";
import prisma from "@/lib/prisma";
import { randomUUID } from "crypto";
import { BotStatus, WorkStatus, WorkType } from "@/generated/prisma";

export const runtime = "nodejs";

// ---- debug helpers ----
const API_DEBUG: boolean = (() => {
  const v = process.env.API_BOT_CONTROL_DEBUG;
  if (!v) return false;
  const s = v.trim().toLowerCase();
  return s === "1" || s === "true" || s === "yes" || s === "y" || s === "on";
})();

function nowNs(): bigint {
  return process.hrtime.bigint();
}
function msSince(start: bigint): number {
  const ns = process.hrtime.bigint() - start;
  return Number(ns / BigInt(1_000_000));
}
function dbg(label: string, fields: Record<string, unknown>): void {
  if (!API_DEBUG) return;
  const ts = new Date().toISOString();
  try {
    console.log(`[bot-control] ${label} ${ts} ${JSON.stringify(fields)}`);
  } catch {
    console.log(`[bot-control] ${label} ${ts}`, fields);
  }
}

function jsonError(status: number, code: string, detail?: unknown): Response {
  const payload: { ok: false; error: string; detail?: unknown } = {
    ok: false,
    error: code,
  };
  if (typeof detail !== "undefined") payload.detail = detail;
  return Response.json(payload, { status });
}

// ---- validation ----
const BodySchema = z.object({
  id: z.string().min(1),
  action: z.union([z.literal("START"), z.literal("STOP")]),
});

// ---- helpers ----
const OPEN_STATUSES: WorkStatus[] = [WorkStatus.QUEUED, WorkStatus.IN_PROGRESS];
/** 열려있는(QUEUED/IN_PROGRESS) 작업 존재 여부 조회 */
async function hasOpenWorkItem(params: {
  userId: string;
  botId: string;
  type?: WorkType; // 지정하면 해당 타입만, 없으면 모든 타입
}): Promise<boolean> {
  const { userId, botId, type } = params;

  if (type) {
    // dedupeKey는 `${type}:${userId}:${botId}`
    const dedupeKey = `${type}:${userId}:${botId}`;
    const row = await prisma.workItem.findFirst({
      where: {
        dedupeKey,
        status: { in: OPEN_STATUSES },
      },
      select: { id: true },
    });
    return !!row;
  }

  // 모든 타입 대상으로 열린 작업 존재 여부
  const row = await prisma.workItem.findFirst({
    where: {
      userId,
      botId,
      status: { in: OPEN_STATUSES },
    },
    select: { id: true },
  });
  return !!row;
}

/** START 허용 상태 집합 */
const START_ALLOWED: ReadonlySet<BotStatus | null> = new Set<BotStatus | null>([
  null,
  BotStatus.STOPPED,
  BotStatus.STOPPING,
  BotStatus.ERROR,
]);

export async function POST(req: NextRequest) {
  const reqId = randomUUID();
  const t0 = nowNs();
  dbg("REQUEST_IN", { reqId });

  // 1) 인증
  const userId = await getUserId();
  if (!userId) {
    dbg("UNAUTH", { reqId, durMs: msSince(t0) });
    return jsonError(401, "UNAUTH");
  }

  // 2) 파싱
  let bodyUnknown: unknown;
  try {
    bodyUnknown = await req.json();
  } catch {
    dbg("INVALID_JSON", { reqId, durMs: msSince(t0) });
    return jsonError(400, "INVALID_JSON");
  }
  const parsed = BodySchema.safeParse(bodyUnknown);
  if (!parsed.success) {
    const msg = parsed.error.message;
    dbg("BAD_BODY", { reqId, error: msg, durMs: msSince(t0) });
    return jsonError(400, "BAD_BODY", msg);
  }
  const botId = parsed.data.id;
  const action = parsed.data.action; // "START" | "STOP"

  // 3) 현재 런타임 상태
  const status = await getBotRuntimeStatus(botId);
  dbg("STATUS_CHECK", { reqId, botId, status });

  if (action === "START") {
    // 3-1) 이미 러닝인지 보강 확인 (heartbeat 신선 여부 포함)
    const running = await isBotCurrentlyRunning(botId);
    dbg("RUNNING_CHECK", { reqId, botId, running });
    if (running) {
      dbg("ALREADY_RUNNING", { reqId, botId, durMs: msSince(t0) });
      return jsonError(409, "ALREADY_RUNNING");
    }

    // 3-2) START 허용 상태 확인
    if (!START_ALLOWED.has(status)) {
      dbg("NOT_ALLOWED_TO_START", { reqId, botId, status, durMs: msSince(t0) });
      return jsonError(409, "NOT_ALLOWED_TO_START", { status });
    }

    // 3-3) 중복 실행 방지
    // - 동일 START 작업이 열려 있으면 차단
    const hasOpenStart = await hasOpenWorkItem({
      userId,
      botId,
      type: WorkType.START_BOT,
    });
    if (hasOpenStart) {
      dbg("ALREADY_ENQUEUED_START", { reqId, botId, durMs: msSince(t0) });
      return jsonError(409, "ALREADY_ENQUEUED_START");
    }
    // - STOP 작업이 열려 있으면 START 차단 (정지 중에는 시작 금지)
    const hasOpenStop = await hasOpenWorkItem({
      userId,
      botId,
      type: WorkType.STOP_BOT,
    });
    if (hasOpenStop) {
      dbg("STOP_IN_PROGRESS", { reqId, botId, durMs: msSince(t0) });
      return jsonError(409, "STOP_IN_PROGRESS");
    }

    // 3-4) 선반영: desiredState='RUNNING'
    try {
      await prisma.botRuntime.upsert({
        where: { botId },
        update: {
          desiredState: BotStatus.RUNNING,
          updatedAt: new Date(),
        },
        create: {
          botId,
          status: BotStatus.STOPPED,
          desiredState: BotStatus.RUNNING,
          updatedAt: new Date(),
        },
      });
      dbg("UPSERT_DESIRED_RUNNING", { reqId, botId });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "UPSERT_FAILED";
      dbg("UPSERT_ERROR", { reqId, botId, msg, durMs: msSince(t0) });
      return jsonError(500, "UPSERT_DESIRED_RUNNING_FAILED", msg);
    }

    // 3-5) 큐 enqueue (멱등)
    dbg("ENQUEUE_START_ATTEMPT", { reqId, botId, userId });
    const result = await controlBots({
      requesterId: userId,
      action: "START",
      botIds: [botId],
    });

    dbg("ENQUEUE_START_RESULT", {
      reqId,
      botId,
      updated: result.updated,
      requested: result.requested,
      eligible: result.eligible,
    });

    if (result.updated === 0) {
      const first = result.results[0];
      const msg =
        (first?.reason as string | undefined) ?? "FAILED_TO_ENQUEUE_START";
      const statusCode = msg === "NOT_AUTHORIZED_OR_NOT_FOUND" ? 404 : 400;
      dbg("ENQUEUE_START_FAIL", {
        reqId,
        botId,
        msg,
        status: statusCode,
        durMs: msSince(t0),
      });
      return jsonError(statusCode, msg);
    }

    const first = result.results[0] ?? null;
    dbg("SUCCESS_START", {
      reqId,
      botId,
      workItemId: first?.workItem?.id ?? null,
      durMs: msSince(t0),
    });
    return Response.json({ ok: true, workItem: first?.workItem ?? null });
  }

  // action === "STOP"
  // 설계: STOP은 열린 START가 있어도 허용(워커는 STOP을 우선 처리). 단, 열린 STOP이 있으면 차단.
  // 4-1) 열린 STOP 존재 시 차단
  const hasOpenStop = await hasOpenWorkItem({
    userId,
    botId,
    type: WorkType.STOP_BOT,
  });
  if (hasOpenStop) {
    dbg("ALREADY_ENQUEUED_STOP", { reqId, botId, durMs: msSince(t0) });
    return jsonError(409, "ALREADY_ENQUEUED_STOP");
  }

  // 4-2) 선반영: desiredState='STOPPED' (멱등/보강)
  try {
    await prisma.botRuntime.upsert({
      where: { botId },
      update: {
        desiredState: BotStatus.STOPPED,
        updatedAt: new Date(),
      },
      create: {
        botId,
        status: BotStatus.STOPPING, // 새로 만들 때는 STOPPING으로 표기(과도기)
        desiredState: BotStatus.STOPPED,
        updatedAt: new Date(),
      },
    });
    dbg("UPSERT_DESIRED_STOPPED", { reqId, botId });
  } catch (e) {
    // 선반영 실패해도 큐잉은 진행 (controlBots에서도 선반영 수행)
    dbg("UPSERT_DESIRED_STOPPED_WARN", {
      reqId,
      botId,
      msg: e instanceof Error ? e.message : String(e),
    });
  }

  // 4-3) 큐 enqueue (멱등)
  dbg("ENQUEUE_STOP_ATTEMPT", { reqId, botId, userId });
  const result = await controlBots({
    requesterId: userId,
    action: "STOP",
    botIds: [botId],
  });

  dbg("ENQUEUE_STOP_RESULT", {
    reqId,
    botId,
    updated: result.updated,
    requested: result.requested,
    eligible: result.eligible,
  });

  if (result.updated === 0) {
    const first = result.results[0];
    const msg =
      (first?.reason as string | undefined) ?? "FAILED_TO_ENQUEUE_STOP";
    const statusCode = msg === "NOT_AUTHORIZED_OR_NOT_FOUND" ? 404 : 400;
    dbg("ENQUEUE_STOP_FAIL", {
      reqId,
      botId,
      msg,
      status: statusCode,
      durMs: msSince(t0),
    });
    return jsonError(statusCode, msg);
  }

  const first = result.results[0] ?? null;
  dbg("SUCCESS_STOP", {
    reqId,
    botId,
    workItemId: first?.workItem?.id ?? null,
    durMs: msSince(t0),
  });
  return Response.json({ ok: true, workItem: first?.workItem ?? null });
}
