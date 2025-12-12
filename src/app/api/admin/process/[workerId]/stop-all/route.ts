// /src/app/api/admin/process/[workerId]/stop-all/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { controlBots, collectAllDownlineIds } from "@/server/botControlService";
import { getUserId } from "@/lib/request-user";

interface RouteParams {
  workerId: string;
}

interface ControlBotsResultItem {
  botId: string;
  ok: boolean;
  reason?: string;
  workItem?: unknown;
}

interface ControlBotsResult {
  updated: number;
  requested: number;
  eligible: number;
  results: ControlBotsResultItem[];
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<RouteParams> }
) {
  // Next.js 15: params는 Promise 형태로 취급되므로 먼저 await 해서 구조 분해
  const { workerId: workerIdParam } = await context.params;

  const adminId = await getUserId();
  if (!adminId) {
    return NextResponse.json(
      { ok: false, error: "UNAUTHORIZED" },
      { status: 401 }
    );
  }

  if (!workerIdParam || workerIdParam.length === 0) {
    return NextResponse.json(
      { ok: false, error: "INVALID_WORKER_ID" },
      { status: 400 }
    );
  }

  // 이 관리자가 컨트롤할 수 있는 userId 집합
  const downlineSet = await collectAllDownlineIds(adminId);
  downlineSet.add(adminId);

  // workerId에 붙어있는 봇들 전부 조회
  // BotRuntime: { botId, workerId, bot.userId, status, ... }
  const runtimes = await prisma.botRuntime.findMany({
    where: {
      workerId: workerIdParam,
    },
    select: {
      botId: true,
      status: true,
      bot: {
        select: {
          userId: true,
        },
      },
    },
  });

  // 내가 제어할 수 있는 봇만 추린다 (downlineSet에 속한 userId 소유 봇)
  const controllableBotIds: string[] = [];
  for (const rt of runtimes) {
    const ownerUserId = rt.bot.userId;
    const okOwner = downlineSet.has(ownerUserId);
    // (status 조건으로 RUNNING/STARTING만 고르고 싶으면 여기서 필터 가능)
    if (okOwner) {
      controllableBotIds.push(rt.botId);
    }
  }

  if (controllableBotIds.length === 0) {
    return NextResponse.json({
      ok: true,
      data: {
        requested: 0,
        stopped: 0,
        botIds: [] as string[],
      },
    });
  }

  // STOP_BOT workItem enqueue
  const result = (await controlBots({
    requesterId: adminId,
    action: "STOP",
    botIds: controllableBotIds,
  })) as ControlBotsResult;

  // controlBots 결과를 바탕으로 성공적으로 stop 요청된 botId들만 수집
  const stoppedOkIds: string[] = [];
  for (const r of result.results) {
    if (r.ok) {
      stoppedOkIds.push(r.botId);
    }
  }

  return NextResponse.json({
    ok: true,
    data: {
      requested: result.requested,
      eligible: result.eligible,
      updated: result.updated,
      stoppedOkIds,
    },
  });
}
