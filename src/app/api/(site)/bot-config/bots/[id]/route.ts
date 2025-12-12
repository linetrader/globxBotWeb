// src/app/api/bot-config/bots/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { Prisma, BotMode, BotStatus as DbBotStatus } from "@/generated/prisma";
import type { ApiResponse } from "@/app/(site)/bot-config/types";
import { getUserId } from "@/lib/request-user";

const IdParamSchema = z.object({ id: z.string().min(1) });

type UiStatus = "RUNNING" | "STOPPED" | "UNKNOWN";

function toUiStatus(s: DbBotStatus | null): UiStatus {
  if (!s) return "STOPPED";
  if (s === "RUNNING") return "RUNNING";
  if (s === "STOPPED") return "STOPPED";
  // STARTING / STOPPING / ERROR 등은 UI 제어상 UNKNOWN 처리
  return "UNKNOWN";
}

/** GET /api/bot-config/bots/[id] : 단일 봇 상태 조회 */
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<unknown>>> {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json<ApiResponse<unknown>>(
        { ok: false, error: "Unauthorized", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const rawParams = await context.params; // Next 15: params is Promise
    const { id } = IdParamSchema.parse(rawParams);

    const bot = await prisma.tradingBot.findFirst({
      where: { id, userId },
      select: { id: true, name: true, mode: true, symbol: true, enabled: true },
    });
    if (!bot) {
      return NextResponse.json<ApiResponse<unknown>>(
        { ok: false, error: "Bot not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    const runtime = await prisma.botRuntime.findUnique({
      where: { botId: bot.id },
      select: { status: true, updatedAt: true },
    });

    const statusRaw: DbBotStatus | null = runtime?.status ?? null;
    const status: UiStatus = toUiStatus(statusRaw);

    const data = {
      id: bot.id,
      name: bot.name,
      mode: (bot.mode === BotMode.SINGLE ? "SINGLE" : "MULTI") as
        | "SINGLE"
        | "MULTI",
      symbol: bot.symbol,
      enabled: bot.enabled,
      status, // UI용 간소화 상태
      statusRaw: statusRaw ?? undefined, // DB enum 원본 (옵셔널)
      statusUpdatedAt: runtime?.updatedAt?.toISOString(),
    };

    return NextResponse.json<ApiResponse<typeof data>>(
      { ok: true, data },
      { status: 200 }
    );
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json<ApiResponse<unknown>>(
        {
          ok: false,
          error: "Invalid id",
          code: "INVALID_PARAM",
          issues: e.flatten(),
        },
        { status: 400 }
      );
    }
    const msg = e instanceof Error ? e.message : "UNKNOWN";
    return NextResponse.json<ApiResponse<unknown>>(
      { ok: false, error: msg, code: "INTERNAL" },
      { status: 500 }
    );
  }
}

/** DELETE /api/bot-config/bots/[id] : Bot 및 관련 레코드 삭제 */
export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<null>>> {
  try {
    const rawParams = await context.params;
    const { id } = IdParamSchema.parse(rawParams);

    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json<ApiResponse<null>>(
        { ok: false, error: "Unauthorized", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    // 소유권 검증
    const bot = await prisma.tradingBot.findFirst({
      where: { id, userId },
      select: { id: true },
    });
    if (!bot) {
      return NextResponse.json<ApiResponse<null>>(
        { ok: false, error: "Bot not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    // FK 제약을 피하기 위해 자식 레코드부터 삭제
    await prisma.$transaction(async (tx) => {
      // BotBackupItem (에러에 나온 FK)
      await tx.botBackupItem.deleteMany({
        where: { botId: id },
      });

      // 필요 시 다른 종속 테이블도 여기서 정리 (예: BotRuntime 등)
      await tx.botRuntime.deleteMany({
        where: { botId: id },
      });

      // 마지막에 TradingBot 삭제
      await tx.tradingBot.delete({
        where: { id },
      });
    });

    return NextResponse.json<ApiResponse<null>>(
      { ok: true, data: null },
      { status: 200 }
    );
  } catch (e: unknown) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2025"
    ) {
      return NextResponse.json<ApiResponse<null>>(
        { ok: false, error: "Bot not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }
    if (e instanceof z.ZodError) {
      return NextResponse.json<ApiResponse<null>>(
        {
          ok: false,
          error: "Invalid id",
          code: "INVALID_PARAM",
          issues: e.flatten(),
        },
        { status: 400 }
      );
    }
    const msg = e instanceof Error ? e.message : "UNKNOWN";
    return NextResponse.json<ApiResponse<null>>(
      { ok: false, error: msg, code: "INTERNAL" },
      { status: 500 }
    );
  }
}
