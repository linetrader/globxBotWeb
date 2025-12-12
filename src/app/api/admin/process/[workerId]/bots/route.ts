// src/app/api/admin/process/[workerId]/bots/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserId } from "@/lib/request-user";
import { collectAllDownlineIds } from "@/server/botControlService";

// 이 라우트는 항상 런타임 DB 조회가 필요하므로 정적 캐시/프리렌더 금지
export const dynamic = "force-dynamic";

type WorkerIdParams = {
  workerId: string;
};

/**
 * GET /api/admin/process/[workerId]/bots
 *
 * 응답 형식:
 * {
 *   ok: true;
 *   data: Array<{
 *     botId: string;
 *     botName: string;
 *     username: string;
 *   }>;
 * }
 *
 * 접근 제어:
 * - 로그인한 adminId와 그 하위(downline) 유저들의 봇만 리턴
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<WorkerIdParams> }
) {
  // 1) 권한 체크
  const adminId = await getUserId();
  if (!adminId) {
    return NextResponse.json(
      {
        ok: false,
        error: "UNAUTHORIZED",
      },
      { status: 401 }
    );
  }

  // 2) Next.js 15 규칙: params는 Promise라서 await 해야 함
  //    (params.workerId 직접 접근하면 sync-dynamic-apis 경고 발생)
  const { workerId } = await context.params;

  if (!workerId || typeof workerId !== "string") {
    return NextResponse.json(
      {
        ok: false,
        error: "INVALID_WORKER_ID",
      },
      { status: 400 }
    );
  }

  // 3) admin + downline userSet
  const downlineSet = await collectAllDownlineIds(adminId);
  downlineSet.add(adminId);

  /**
   * botRuntime 스키마 가정:
   *  - workerId: string | null
   *  - botId: string
   *  - bot: {
   *      name: string
   *      userId: string
   *      user: {
   *        username: string
   *      }
   *    }
   *
   * 실제 prisma schema에서 필드명이 다르면 아래 select 부분만 맞춰주면 된다.
   */
  const runtimes = await prisma.botRuntime.findMany({
    where: {
      workerId,
    },
    select: {
      botId: true,
      bot: {
        select: {
          name: true,
          userId: true,
          user: {
            select: {
              username: true,
            },
          },
        },
      },
    },
  });

  // 4) admin이 접근 가능한 유저(downline)에 속한 봇만 필터
  const visibleBots = runtimes.filter((rt) => {
    // rt.bot이 없을 경우 대비
    if (!rt.bot) {
      return false;
    }
    return downlineSet.has(rt.bot.userId);
  });

  // 5) 직렬화
  const data = visibleBots.map((rt) => {
    const botName = rt.bot?.name ?? "";
    const username = rt.bot?.user?.username ?? "";
    return {
      botId: rt.botId,
      botName,
      username,
    };
  });

  return NextResponse.json({
    ok: true,
    data,
  });
}
