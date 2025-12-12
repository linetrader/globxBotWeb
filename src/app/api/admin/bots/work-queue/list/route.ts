// src/app/api/admin/bots/work-queue/list/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserId } from "@/lib/request-user";
import { Prisma, WorkStatus } from "@/generated/prisma";

type StatusFilterParam = WorkStatus | "ALL";

/**
 * 하위 유저까지 접근 가능한 userId 수집
 * - referralEdge(parentId -> childId) 그래프를 최대 20단계까지 BFS
 */
async function collectAllDownlineIds(rootUserId: string): Promise<Set<string>> {
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

export async function GET(req: NextRequest) {
  const adminId = await getUserId();
  if (!adminId) {
    return NextResponse.json(
      { ok: false, error: "UNAUTHORIZED" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);

  // page
  const pageRaw = searchParams.get("page");
  const pageParsed = pageRaw ? parseInt(pageRaw, 10) : 1;
  const page = Number.isNaN(pageParsed) || pageParsed < 1 ? 1 : pageParsed;

  // pageSize
  const pageSizeRaw = searchParams.get("pageSize");
  const pageSizeParsed = pageSizeRaw ? parseInt(pageSizeRaw, 10) : 20;
  const pageSize =
    Number.isNaN(pageSizeParsed) || pageSizeParsed < 1
      ? 20
      : Math.min(pageSizeParsed, 100);

  // status 필터
  const statusParamRaw = searchParams.get("status");
  const statusParam: StatusFilterParam =
    statusParamRaw && statusParamRaw.length > 0
      ? (statusParamRaw as StatusFilterParam)
      : "ALL";

  // username 부분검색 필터 (부분 일치, 대소문자 무시)
  const usernameRaw = searchParams.get("username") ?? "";
  const usernameFilter = usernameRaw.trim();

  // 관리자가 접근 가능한 userId 들 (본인 + 다운라인)
  const downlineSet = await collectAllDownlineIds(adminId);
  const allowedUserIdsArr = [adminId, ...downlineSet];

  /**
   * usernameFilter가 있는 경우:
   *   1) allowedUserIdsArr 중에서 username LIKE %usernameFilter% 인 user만 추림
   *   2) 그 userId 리스트로만 workItem을 본다.
   *
   * usernameFilter가 빈 문자열이면 그냥 allowedUserIdsArr 전체 허용
   */
  let filteredUserIdsArr: string[] = allowedUserIdsArr;
  if (usernameFilter !== "") {
    const matchedUsers = await prisma.user.findMany({
      where: {
        id: { in: allowedUserIdsArr },
        username: {
          contains: usernameFilter,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
      },
    });

    filteredUserIdsArr = matchedUsers.map((u) => u.id);

    // 매칭되는 유저가 하나도 없으면 바로 빈 결과 리턴 가능
    if (filteredUserIdsArr.length === 0) {
      return NextResponse.json({
        ok: true,
        data: [],
        total: 0,
      });
    }
  }

  // Prisma.WorkItemWhereInput 구성
  // WorkItem 모델에는 user relation이 없다고 가정하고 userId 기준만 사용
  const whereClause: Prisma.WorkItemWhereInput = {
    userId: { in: filteredUserIdsArr },
  };

  if (statusParam !== "ALL") {
    whereClause.status = statusParam as WorkStatus;
  }

  // total count
  const total = await prisma.workItem.count({
    where: whereClause,
  });

  // 목록 조회
  // bot / bot.user / runs 정보를 함께 select
  const items = await prisma.workItem.findMany({
    where: whereClause,
    orderBy: {
      createdAt: "desc",
    },
    skip: (page - 1) * pageSize,
    take: pageSize,
    select: {
      id: true,
      userId: true,
      botId: true,
      type: true,
      status: true,
      attempts: true,
      dedupeKey: true,
      sqsGroupId: true,
      createdAt: true,
      updatedAt: true,
      bot: {
        select: {
          id: true,
          name: true,
          userId: true,
          user: {
            select: {
              username: true,
            },
          },
        },
      },
      runs: {
        take: 1,
        orderBy: {
          startedAt: "desc",
        },
        select: {
          startedAt: true,
          finishedAt: true,
          exitCode: true,
          error: true,
          workerTaskArn: true,
          queueDelaySec: true,
        },
      },
    },
  });

  /**
   * username 표시:
   *  - WorkItem에는 user relation이 (스키마 상) 없을 수 있으므로,
   *    rows를 만들기 전에 items에 등장한 userId들을 모아서
   *    user 테이블에서 username을 한 번에 조회한다.
   *
   *    mapUser[userId] = username
   */
  const uniqueUserIds = Array.from(new Set(items.map((it) => it.userId)));

  const userRows = await prisma.user.findMany({
    where: { id: { in: uniqueUserIds } },
    select: {
      id: true,
      username: true,
    },
  });

  const userMap: Record<string, string | null> = {};
  for (const u of userRows) {
    userMap[u.id] = u.username ?? null;
  }

  // shape 변환
  const rows = items.map((wi) => {
    const lastRun = wi.runs.length > 0 ? wi.runs[0] : null;

    // username 우선순위:
    // 1) workItem.userId 에 해당하는 user.username (userMap)
    // 2) bot.user.username (봇 주인)
    const usernameFromOwner = userMap[wi.userId] ?? null;
    const usernameFromBotOwner = wi.bot?.user?.username ?? null;
    const finalUsername = usernameFromOwner ?? usernameFromBotOwner ?? null;

    return {
      id: wi.id,
      userId: wi.userId,
      username: finalUsername,

      botId: wi.botId ?? null,
      botName: wi.bot?.name ?? null,

      type: wi.type,
      status: wi.status,
      attempts: wi.attempts,

      dedupeKey: wi.dedupeKey ?? null,
      sqsGroupId: wi.sqsGroupId ?? null,

      createdAt: wi.createdAt.toISOString(),
      updatedAt: wi.updatedAt.toISOString(),

      lastAttemptStartedAt: lastRun?.startedAt
        ? lastRun.startedAt.toISOString()
        : null,
      lastAttemptFinishedAt: lastRun?.finishedAt
        ? lastRun.finishedAt.toISOString()
        : null,
      lastAttemptExitCode:
        typeof lastRun?.exitCode === "number" ? lastRun.exitCode : null,
      lastAttemptError: lastRun?.error ?? null,
      lastAttemptWorkerTaskArn: lastRun?.workerTaskArn ?? null,
      queueDelaySec:
        typeof lastRun?.queueDelaySec === "number"
          ? lastRun.queueDelaySec
          : null,
    };
  });

  return NextResponse.json({
    ok: true,
    data: rows,
    total,
  });
}
