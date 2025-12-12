// src/app/api/admin/bots/work-queue/cleanup/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserId } from "@/lib/request-user";

// 하위 유저까지 접근 가능한 userId 수집
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

type CleanupBody = {
  keepDays: number; // 예: 30
};

export async function POST(req: NextRequest) {
  const adminId = await getUserId();
  if (!adminId) {
    return NextResponse.json(
      { ok: false, error: "UNAUTHORIZED" },
      { status: 401 }
    );
  }

  let body: CleanupBody;
  try {
    body = (await req.json()) as CleanupBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: "INVALID_JSON" },
      { status: 400 }
    );
  }

  const { keepDays } = body;

  if (
    typeof keepDays !== "number" ||
    !Number.isFinite(keepDays) ||
    keepDays < 0
  ) {
    return NextResponse.json(
      { ok: false, error: "INVALID_KEEP_DAYS" },
      { status: 400 }
    );
  }

  // 현재 시각(now) 기준으로 keepDays 일수 이전 cutoff
  const now = new Date();
  const cutoffMs = now.getTime() - keepDays * 24 * 60 * 60 * 1000;
  const cutoffDate = new Date(cutoffMs);

  // admin과 그 하위 유저
  const downlineSet = await collectAllDownlineIds(adminId);
  const allowedUserIds = [adminId, ...downlineSet];

  // SUCCEEDED && createdAt < cutoff && userId in allowedUserIds
  const result = await prisma.workItem.deleteMany({
    where: {
      userId: { in: allowedUserIds },
      status: "SUCCEEDED",
      createdAt: { lt: cutoffDate },
    },
  });

  return NextResponse.json({
    ok: true,
    deleted: result.count,
    cutoffIso: cutoffDate.toISOString(),
  });
}
