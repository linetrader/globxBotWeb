// src/app/api/(site)/bot-config/bots/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserId } from "@/lib/request-user";
import { BotMode } from "@/generated/prisma";
import type { BotStatus } from "@/app/[locale]/(site)/bot-config/types";

// 확장 상태를 보존해서 반환
function runtimeToBotStatus(runtime: { status: string } | null): BotStatus {
  if (!runtime) return "STOPPED";
  const raw = String(runtime.status).toUpperCase();
  if (
    raw === "RUNNING" ||
    raw === "STOPPED" ||
    raw === "STARTING" ||
    raw === "STOPPING" ||
    raw === "ERROR"
  ) {
    return raw as BotStatus;
  }
  return "UNKNOWN";
}

export async function GET() {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const bots = await prisma.tradingBot.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      mode: true,
      symbol: true,
      enabled: true,
      BotRuntime: { select: { status: true } }, // 확장 상태 원본
    },
    orderBy: [{ updatedAt: "desc" }],
  });

  const rows = bots.map((b) => {
    const status = runtimeToBotStatus(b.BotRuntime ?? null);
    return {
      id: b.id,
      name: b.name,
      mode: (b.mode === BotMode.SINGLE ? "SINGLE" : "MULTI") as
        | "SINGLE"
        | "MULTI",
      symbol: b.symbol,
      enabled: b.enabled,
      status, // 확장 상태 그대로
    };
  });

  return NextResponse.json({ ok: true, data: rows });
}
