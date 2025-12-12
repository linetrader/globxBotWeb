// src/server/botControlService.ts
import prisma from "@/lib/prisma";
import { enqueueWorkItem } from "@/server/enqueueWorkItem";
import { WorkType, BotStatus } from "@/generated/prisma";

export type ControlBotsParams = {
  requesterId: string;
  action: "START" | "STOP";
  botIds: string[];
};

export type EnqueueResult = Awaited<ReturnType<typeof enqueueWorkItem>>;

export interface ControlBotResult {
  botId: string;
  ok: boolean;
  reason?: string;
  workItem?: EnqueueResult;
}

export interface ControlBotsReturn {
  updated: number;
  requested: number;
  eligible: number;
  results: ControlBotResult[];
}

/** 런타임 상태 정규화 (null -> STOPPED 취급) */
function normalizeRuntimeStatus(s: string | null | undefined): BotStatus {
  // prisma 쪽 BotStatus enum/union이
  // "STOPPED" | "STARTING" | "RUNNING" | "STOPPING" | "ERROR"
  // 라고 가정하고 그대로 캐스팅.
  return (s ?? "STOPPED") as BotStatus;
}

/** adminId 기준 다운라인 전체(userId) 수집: referralEdge.parentId -> childId BFS */
export async function collectAllDownlineIds(
  rootUserId: string
): Promise<Set<string>> {
  const visited = new Set<string>();
  let frontier: string[] = [rootUserId];
  const MAX_DEPTH = 20;
  const TAKE_PER_ROUND = 5000;

  for (let depth = 0; depth < MAX_DEPTH && frontier.length > 0; depth += 1) {
    const edges = await prisma.referralEdge.findMany({
      where: { parentId: { in: frontier } },
      select: { childId: true },
      take: TAKE_PER_ROUND,
    });
    if (edges.length === 0) break;

    const next: string[] = [];
    for (const e of edges) {
      if (!visited.has(e.childId)) {
        visited.add(e.childId);
        next.push(e.childId);
      }
    }
    frontier = next;
  }

  return visited;
}

/** UI 표시에 쓰는 mode 문자열 변환 (참고용 유틸 그대로 유지) */
export function modeToString(mode: unknown): "SINGLE" | "MULTI" {
  return mode === "MULTI" ? "MULTI" : "SINGLE";
}

/** 런타임 status -> {status, running} 정규화 (참고용 유틸 그대로 유지) */
export function runtimeToFlags(rawStatus: string | null): {
  status: "STOPPED" | "STARTING" | "RUNNING" | "STOPPING" | "ERROR";
  running: boolean;
} {
  const s = (rawStatus ?? "STOPPED") as
    | "STOPPED"
    | "STARTING"
    | "RUNNING"
    | "STOPPING"
    | "ERROR";
  const running = s === "RUNNING" || s === "STARTING";
  return { status: s, running };
}

export async function controlBots(
  params: ControlBotsParams
): Promise<ControlBotsReturn> {
  const { requesterId, action } = params;

  // botIds 중 복제/공백 제거 및 순서 유지
  const dedupedIds: string[] = [];
  const seen = new Set<string>();
  for (const id of params.botIds) {
    const t = typeof id === "string" ? id.trim() : "";
    if (t !== "" && !seen.has(t)) {
      seen.add(t);
      dedupedIds.push(t);
    }
  }

  // 다운라인(userId) 권한 세트 구성
  const downlineSet = await collectAllDownlineIds(requesterId);
  const allowedUserIdsSet = new Set<string>([requesterId, ...downlineSet]);

  // 요청된 bot들만 조회 (권한 필터는 여기선 안 걸고, 아래에서 직접 체크)
  const bots = await prisma.tradingBot.findMany({
    where: { id: { in: dedupedIds } },
    select: {
      id: true,
      userId: true,
      // 🔼 변경: STOP 라우팅 타게팅을 위해 workerId도 함께 조회
      BotRuntime: { select: { status: true, workerId: true } },
    },
  });

  // 빠른 lookup을 위한 맵
  interface BotRecord {
    id: string;
    userId: string;
    BotRuntime: { status: string | null; workerId: string | null } | null;
  }
  const botMap = new Map<string, BotRecord>();
  for (const b of bots) {
    botMap.set(b.id, b as BotRecord);
  }

  // 상태 허용 규칙
  const START_ALLOWED = new Set<BotStatus>(["STOPPED", "STOPPING", "ERROR"]);
  const STOP_ALLOWED = new Set<BotStatus>(["STARTING", "RUNNING", "ERROR"]);

  const results: ControlBotResult[] = [];
  let successCount = 0;
  let eligibleCount = 0;

  // 중요: 요청 순서(dedupedIds 순서)대로 처리해서
  // results[0]가 항상 첫 요청 봇에 대한 결과가 되도록 한다.
  for (const botId of dedupedIds) {
    const found = botMap.get(botId);

    // 1) 존재 여부 + 권한 체크
    if (!found || !allowedUserIdsSet.has(found.userId)) {
      results.push({
        botId,
        ok: false,
        reason: "NOT_AUTHORIZED_OR_NOT_FOUND",
      });
      continue;
    }

    // 2) 현재 runtime status 판정
    const curStatus = normalizeRuntimeStatus(found.BotRuntime?.status ?? null);

    // 3) 이 상태에서 action 가능한지 판별
    const canStart = action === "START" && START_ALLOWED.has(curStatus);
    const canStop = action === "STOP" && STOP_ALLOWED.has(curStatus);
    const isEligible = canStart || canStop;

    if (!isEligible) {
      results.push({
        botId,
        ok: false,
        reason: "NOT_ELIGIBLE_STATE",
      });
      continue;
    }

    // 🔽 변경: STOP이면 desiredState를 즉시 STOPPED로 선반영(멱등 upsert)
    if (action === "STOP") {
      try {
        await prisma.botRuntime.upsert({
          where: { botId: found.id },
          update: {
            desiredState: "STOPPED",
            // 운영 선호에 따라 다음 라인 활성화 가능:
            // status: "STOPPING",
            updatedAt: new Date(),
          },
          create: {
            botId: found.id,
            desiredState: "STOPPED",
            status: "STOPPING",
            updatedAt: new Date(),
          },
        });
      } catch {
        // 선반영 실패는 STOP 큐잉 자체는 막지 않음 (로그만 운영 레벨에서 처리)
      }
    }

    eligibleCount += 1;

    // 4) enqueue 시도
    const workType =
      action === "START" ? WorkType.START_BOT : WorkType.STOP_BOT;

    try {
      // 🔽 변경: STOP 큐잉 시 payload에 targetWorkerId 포함(러너 워커로 라우팅)
      const targetWorkerId =
        action === "STOP" ? (found.BotRuntime?.workerId ?? null) : null;

      const workItem = await enqueueWorkItem({
        userId: found.userId,
        botId: found.id,
        type: workType,
        payload: {
          action: action === "START" ? "START_BOT" : "STOP_BOT",
          botId: found.id,
          requestedBy: requesterId,
          targetWorkerId, // 워커 측에서 이 값을 보고 STOP_BOT을 해당 워커만 lease하도록 필터
        },
        // 필요시 워커 파티셔닝 강화:
        // sqsGroupId: targetWorkerId ?? found.id,
      });

      successCount += 1;
      results.push({
        botId,
        ok: true,
        workItem,
      });
    } catch (err) {
      results.push({
        botId,
        ok: false,
        reason: err instanceof Error ? err.message : "ENQUEUE_FAILED_UNKNOWN",
      });
    }
  }

  return {
    updated: successCount, // enqueue 성공한 봇 수
    requested: dedupedIds.length, // 사용자 요청 봇 수 (중복 제거 후)
    eligible: eligibleCount, // 상태상 eligible 했던 봇 수
    results, // 요청 순서대로의 결과
  };
}
