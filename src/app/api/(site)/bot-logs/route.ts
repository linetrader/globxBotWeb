// src/app/api/bot-logs/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { PrismaClient, type LogLevel } from "@/generated/prisma";

// --- prisma singleton ---
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// --- zod schema ---
const QuerySchema = z.object({
  botId: z.string().min(1).optional(),
  level: z
    .custom<LogLevel>((v) => typeof v === "string" && v.length > 0)
    .optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  cursorTs: z.string().datetime().optional(), // ISO
  cursorId: z.string().min(1).optional(),
});

// --- cursor where 타입(빈 오브젝트 타입 {} 사용하지 않음) ---
type CursorWhere = {
  OR?: [{ createdAt: { lt: Date } }, { createdAt: Date; id: { lt: string } }];
};

function ltCursor(cursorTs?: string, cursorId?: string): CursorWhere {
  if (!cursorTs || !cursorId) return {};
  const ts = new Date(cursorTs);
  return {
    OR: [{ createdAt: { lt: ts } }, { createdAt: ts, id: { lt: cursorId } }],
  };
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const parsed = QuerySchema.safeParse(Object.fromEntries(url.searchParams));
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "INVALID_QUERY", detail: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { botId, level, limit, cursorTs, cursorId } = parsed.data;

    const where = {
      ...(botId ? { botId } : {}),
      ...(level ? { level } : {}),
      ...ltCursor(cursorTs, cursorId),
    };

    const rows = await prisma.botLog.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit,
      select: {
        id: true,
        botId: true,
        level: true,
        message: true,
        createdAt: true,
      },
    });

    const items = rows.map((r) => ({
      id: r.id,
      botId: r.botId,
      level: r.level,
      message: r.message,
      createdAt: r.createdAt.toISOString(),
    }));

    const last = rows[rows.length - 1];
    const nextCursor = last
      ? { cursorTs: last.createdAt.toISOString(), cursorId: last.id }
      : null;

    return NextResponse.json({
      ok: true,
      items,
      nextCursor,
    } satisfies import("@/types/bot-logs").BotLogListResponse);
  } catch (err) {
    const message = err instanceof Error ? err.message : "UNKNOWN_ERROR";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
