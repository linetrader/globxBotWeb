// src/app/api/admin/bots/restore-start/route.ts
import prisma from "@/lib/prisma";
import { getUserId } from "@/lib/request-user";
import { controlBots, collectAllDownlineIds } from "@/server/botControlService";

export const runtime = "nodejs";

type JsonOk = {
  ok: true;
  backupId: string;
  total: number;
  started: { updated: number; requested: number; eligible: number };
};
type JsonErr = { ok: false; error: string };

function jsonOk(payload: JsonOk): Response {
  return Response.json(payload, { status: 200 });
}
function jsonErr(status: number, error: string): Response {
  return Response.json({ ok: false, error } as JsonErr, { status });
}

function delayMs(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * POST /api/admin/bots/restore-start
 * - 요청자(userId)의 가장 최근 BotBackupSet을 조회
 * - 그 세트에 포함된 botId들을 1초 간격으로 순차 START 큐잉
 */
export async function POST() {
  const requesterId = await getUserId();
  if (!requesterId) return jsonErr(401, "UNAUTHORIZED");

  // 가장 최근 백업 세트
  const latest = await prisma.botBackupSet.findFirst({
    where: { userId: requesterId },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });
  if (!latest) return jsonErr(404, "NO_BACKUP_SET");

  const items = await prisma.botBackupItem.findMany({
    where: { backupId: latest.id },
    select: { botId: true },
    orderBy: { createdAt: "asc" },
  });

  const botIds = items.map((i) => i.botId);
  if (botIds.length === 0) return jsonErr(400, "EMPTY_BACKUP_SET");

  // 권한 체크: controlBots가 봐주지만, 빠른 실패를 위해 다운라인 미리 조회
  const downline = await collectAllDownlineIds(requesterId);
  const allowedSet = new Set<string>([requesterId, ...downline]);

  // 요청 순서를 유지하며 1초 텀으로 START
  let updated = 0;
  let requested = 0;
  let eligible = 0;

  for (const botId of botIds) {
    // controlBots 내부에서 권한도 검증하지만, 외부 유저 봇이면 요청만 낭비하므로 스킵 가능
    const bot = await prisma.tradingBot.findUnique({
      where: { id: botId },
      select: { userId: true },
    });
    if (!bot || !allowedSet.has(bot.userId)) {
      // 권한 없으면 건너뜀
      continue;
    }

    const r = await controlBots({
      requesterId,
      action: "START",
      botIds: [botId],
    });

    updated += r.updated;
    requested += r.requested;
    eligible += r.eligible;

    // 1초 텀
    await delayMs(1000);
  }

  return jsonOk({
    ok: true,
    backupId: latest.id,
    total: botIds.length,
    started: { updated, requested, eligible },
  });
}
