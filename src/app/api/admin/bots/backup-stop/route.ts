// src/app/api/admin/bots/backup-stop/route.ts
import prisma from "@/lib/prisma";
import { getUserId } from "@/lib/request-user";
import { collectAllDownlineIds, controlBots } from "@/server/botControlService";
import { BotStatus } from "@/generated/prisma";

export const runtime = "nodejs";

type JsonOk = {
  ok: true;
  backupId: string;
  count: number;
  stopped: { updated: number; requested: number; eligible: number };
};
type JsonErr = { ok: false; error: string; detail?: unknown };

function jsonOk(payload: JsonOk): Response {
  return Response.json(payload, { status: 200 });
}
function jsonErr(status: number, error: string, detail?: unknown): Response {
  return Response.json({ ok: false, error, detail } as JsonErr, { status });
}

export async function POST() {
  try {
    const requesterId = await getUserId();
    if (!requesterId) return jsonErr(401, "UNAUTHORIZED");

    const downline = await collectAllDownlineIds(requesterId);
    const allowedUserIds = [requesterId, ...downline];

    const runningBots = await prisma.tradingBot.findMany({
      where: {
        userId: { in: allowedUserIds },
        BotRuntime: {
          is: { status: { in: [BotStatus.RUNNING, BotStatus.STARTING] } },
        },
      },
      select: { id: true },
    });

    const botIds = runningBots.map((b) => b.id);
    if (botIds.length === 0) return jsonErr(400, "NO_RUNNING_BOTS");

    const backupSet = await prisma.$transaction(async (tx) => {
      const set = await tx.botBackupSet.create({
        data: { userId: requesterId },
        select: { id: true },
      });
      await tx.botBackupItem.createMany({
        data: botIds.map((id) => ({ backupId: set.id, botId: id })),
        skipDuplicates: true,
      });
      return set;
    });

    const stopResult = await controlBots({
      requesterId,
      action: "STOP",
      botIds,
    });

    return jsonOk({
      ok: true,
      backupId: backupSet.id,
      count: botIds.length,
      stopped: {
        updated: stopResult.updated,
        requested: stopResult.requested,
        eligible: stopResult.eligible,
      },
    });
  } catch (e) {
    // 개발 중 원인 파악을 위해 세부 정보 반환
    const err = e as { code?: string; message?: string; meta?: unknown };
    console.error("[backup-stop] ERROR", err);
    return jsonErr(500, "INTERNAL_ERROR", {
      code: err.code ?? null,
      message: err.message ?? String(e),
      meta: (err as Record<string, unknown>).meta ?? null,
    });
  }
}
