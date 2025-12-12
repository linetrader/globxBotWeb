// src/app/api/admin/process/list/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { collectAllDownlineIds } from "@/server/botControlService";
import { getUserId } from "@/lib/request-user";

const STALE_THRESHOLD_MS = 60_000;

function toIntOrDefault(v: string | null, def: number): number {
  if (!v) {
    return def;
  }
  const n = parseInt(v, 10);
  if (!Number.isFinite(n) || n <= 0) {
    return def;
  }
  return n;
}

function isAliveFilter(v: string | null): v is "ALL" | "ACTIVE" | "STALE" {
  return v === "ALL" || v === "ACTIVE" || v === "STALE";
}

// GET /api/admin/process/list
export async function GET(req: NextRequest) {
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

  const { searchParams } = req.nextUrl;
  const pageParam = searchParams.get("page");
  const pageSizeParam = searchParams.get("pageSize");
  const aliveParam = searchParams.get("alive");

  const page = toIntOrDefault(pageParam, 1);
  const pageSize = toIntOrDefault(pageSizeParam, 20);
  const aliveFilter: "ALL" | "ACTIVE" | "STALE" = isAliveFilter(aliveParam)
    ? aliveParam
    : "ALL";

  // 이 관리자가 접근 가능한 userId 집합
  const downlineSet = await collectAllDownlineIds(adminId);
  downlineSet.add(adminId);

  // 모든 workerProcess 로드 (해당 worker가 어떤 bot을 들고 있는지 포함)
  const processes = await prisma.workerProcess.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      botRuntimes: {
        select: {
          botId: true,
          bot: {
            select: {
              userId: true,
            },
          },
        },
      },
    },
  });

  // 모든 BotRuntime 로드해서 botId ↔ workerId 관계를 전역적으로 분석
  const allRuntimes = await prisma.botRuntime.findMany({
    select: {
      botId: true,
      workerId: true,
    },
    where: {
      workerId: {
        not: null,
      },
    },
  });

  // botId -> Set<workerId>
  const botToWorkersMap: Record<string, Set<string>> = {};
  // workerId -> Set<botId>
  const workerToBotsMap: Record<string, Set<string>> = {};

  for (const rt of allRuntimes) {
    const b = rt.botId;
    const w = rt.workerId;
    if (!w) {
      continue;
    }

    if (!botToWorkersMap[b]) {
      botToWorkersMap[b] = new Set<string>();
    }
    botToWorkersMap[b].add(w);

    if (!workerToBotsMap[w]) {
      workerToBotsMap[w] = new Set<string>();
    }
    workerToBotsMap[w].add(b);
  }

  // 충돌 의심 bot: 한 botId가 2개 이상의 workerId에 묶여있음
  const conflictedBotIdsGlobal = new Set<string>();
  for (const [botId, workerSet] of Object.entries(botToWorkersMap)) {
    if (workerSet.size > 1) {
      conflictedBotIdsGlobal.add(botId);
    }
  }

  const now = new Date();

  // workerProcess 마다 row 생성
  const rowsPre = processes.map((p) => {
    // admin이 제어 가능한 bot만 카운트
    const botIdsForAdmin: string[] = [];
    for (const rt of p.botRuntimes) {
      if (downlineSet.has(rt.bot.userId)) {
        botIdsForAdmin.push(rt.botId);
      }
    }
    const botCountForAdmin = botIdsForAdmin.length;

    // 하트비트 기반 alive 판정
    const lastHb: Date | null = p.lastHeartbeat ?? null;
    let alive = false;
    if (lastHb) {
      const diff = now.getTime() - lastHb.getTime();
      alive = diff <= STALE_THRESHOLD_MS;
    }

    // 이 worker가 가진 bot 중에서 전역적으로 충돌난 bot만 골라내기
    const conflictBotIds: string[] = [];
    const candidateBotIds = workerToBotsMap[p.id];
    if (candidateBotIds) {
      for (const b of candidateBotIds) {
        if (conflictedBotIdsGlobal.has(b)) {
          conflictBotIds.push(b);
        }
      }
    }

    // 좀비 의심: 살아있는데 botCount가 0
    const isZombieSuspect = alive && botCountForAdmin === 0;

    return {
      id: p.id,
      taskArn: p.taskArn ?? null,
      revision: p.revision ?? null,
      createdAt: p.createdAt.toISOString(),
      lastHeartbeat: p.lastHeartbeat ? p.lastHeartbeat.toISOString() : null,
      updatedAt: p.updatedAt.toISOString(),
      botCount: botCountForAdmin,
      alive,
      conflictBotIds,
      isZombieSuspect,
    };
  });

  // aliveFilter 적용
  let filtered = rowsPre;
  if (aliveFilter === "ACTIVE") {
    filtered = rowsPre.filter((r) => r.alive);
  } else if (aliveFilter === "STALE") {
    filtered = rowsPre.filter((r) => !r.alive);
  }

  // 페이지네이션
  const total = filtered.length;
  const startIdx = (page - 1) * pageSize;
  const endIdx = startIdx + pageSize;
  const paged = filtered.slice(startIdx, endIdx);

  return NextResponse.json({
    ok: true,
    data: paged,
    page,
    pageSize,
    total,
  });
}

// DELETE /api/admin/process/list
// payload:
//   { processIds: string[] }  -> 선택삭제(STALE만) 기존 동작
//   { deleteAllStale: true }  -> 접근 가능한 모든 STALE 워커 삭제 (페이지/선택 무관)
export async function DELETE(req: NextRequest) {
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

  let bodyJson: unknown;
  try {
    bodyJson = await req.json();
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "INVALID_JSON",
      },
      { status: 400 }
    );
  }

  if (typeof bodyJson !== "object" || bodyJson === null) {
    return NextResponse.json(
      {
        ok: false,
        error: "INVALID_PAYLOAD",
      },
      { status: 400 }
    );
  }

  const bodyRec = bodyJson as Record<string, unknown>;
  const wantsDeleteAllStale = bodyRec.deleteAllStale === true ? true : false;

  // admin + downline set
  const downlineSet = await collectAllDownlineIds(adminId);
  downlineSet.add(adminId);

  const now = new Date();

  // 경로 A: 전체 STALE 삭제 (페이지/선택 무관)
  if (wantsDeleteAllStale) {
    // 접근 가능한 모든 workerProcess 로드
    const procsAll = await prisma.workerProcess.findMany({
      include: {
        botRuntimes: {
          select: {
            bot: {
              select: {
                userId: true,
              },
            },
          },
        },
      },
    });

    const deletableIdsAll: string[] = [];

    for (const p of procsAll) {
      // 1) 이 워커에 연결된 모든 bot.userId가 downlineSet 안에 있어야 함
      const allBotsAreMine = p.botRuntimes.every((rt) =>
        downlineSet.has(rt.bot.userId)
      );
      if (!allBotsAreMine) {
        continue;
      }

      // 2) STALE 판정 (alive=false)
      const lastHb: Date | null = p.lastHeartbeat ?? null;
      let alive = false;
      if (lastHb) {
        const diff = now.getTime() - lastHb.getTime();
        alive = diff <= STALE_THRESHOLD_MS;
      }
      if (alive) {
        // ACTIVE는 삭제 대상 아님
        continue;
      }

      deletableIdsAll.push(p.id);
    }

    if (deletableIdsAll.length === 0) {
      return NextResponse.json({
        ok: true,
        data: {
          deleted: 0,
        },
      });
    }

    const resultAll = await prisma.workerProcess.deleteMany({
      where: {
        id: {
          in: deletableIdsAll,
        },
      },
    });

    return NextResponse.json({
      ok: true,
      data: {
        deleted: resultAll.count,
      },
    });
  }

  // 경로 B: 선택삭제 (기존 로직)
  if (!Array.isArray(bodyRec.processIds)) {
    return NextResponse.json(
      {
        ok: false,
        error: "INVALID_PAYLOAD",
      },
      { status: 400 }
    );
  }

  const processIdsUnknown = bodyRec.processIds as unknown[];

  const processIds: string[] = [];
  for (const pid of processIdsUnknown) {
    if (typeof pid === "string" && pid.length > 0) {
      processIds.push(pid);
    }
  }

  if (processIds.length === 0) {
    return NextResponse.json(
      {
        ok: false,
        error: "NO_PROCESS_IDS",
      },
      { status: 400 }
    );
  }

  // 후보 프로세스 로드
  const procs = await prisma.workerProcess.findMany({
    where: {
      id: {
        in: processIds,
      },
    },
    include: {
      botRuntimes: {
        select: {
          bot: {
            select: {
              userId: true,
            },
          },
        },
      },
    },
  });

  // 삭제 가능한 프로세스만 추리기:
  // 1) 이 워커에 연결된 모든 bot.userId가 downlineSet 안에 있어야 함
  // 2) STALE (alive=false) 여야 함
  const deletableIds: string[] = [];

  for (const p of procs) {
    const allBotsAreMine = p.botRuntimes.every((rt) =>
      downlineSet.has(rt.bot.userId)
    );
    if (!allBotsAreMine) {
      continue;
    }

    const lastHb: Date | null = p.lastHeartbeat ?? null;
    let alive = false;
    if (lastHb) {
      const diff = now.getTime() - lastHb.getTime();
      alive = diff <= STALE_THRESHOLD_MS;
    }

    if (alive) {
      // ACTIVE 한 것은 삭제 불가
      continue;
    }

    deletableIds.push(p.id);
  }

  if (deletableIds.length === 0) {
    return NextResponse.json({
      ok: true,
      data: {
        deleted: 0,
      },
    });
  }

  // 실제 삭제
  // FK: BotRuntime.workerId onDelete:SetNull 이므로 deleteMany 가능
  const result = await prisma.workerProcess.deleteMany({
    where: {
      id: {
        in: deletableIds,
      },
    },
  });

  return NextResponse.json({
    ok: true,
    data: {
      deleted: result.count,
    },
  });
}
