// src/app/api/bot-config/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { BotMode, GroupKey, MarketKind, Prisma } from "@/generated/prisma";
import { getUserId } from "@/lib/request-user";

/** ---------- Input Schemas ---------- */
const ExchangeItemSchema = z.object({
  exchangeMarketId: z.string().min(1),
  allocationBps: z.number().int().min(0).max(10_000),
  enabled: z.boolean().optional().default(true),
});

const GroupSchema = z.object({
  key: z.nativeEnum(GroupKey),
  exchanges: z.array(ExchangeItemSchema).min(1),
});

const BaseBotSchema = z.object({
  id: z.string().min(1).optional(), // for update
  action: z.enum(["create", "update"]).default("create"),
  name: z.string().min(1).max(60),
  mode: z.nativeEnum(BotMode),
  symbol: z.string().min(1).max(40),
  strategyConfigId: z.string().min(1),
});

const SingleBotSchema = BaseBotSchema.extend({
  mode: z.literal(BotMode.SINGLE),
  exchangeMarketId: z.string().min(1),
  singleMarketKind: z.nativeEnum(MarketKind),
  groups: z.undefined().optional(),
});

const MultiBotSchema = BaseBotSchema.extend({
  mode: z.literal(BotMode.MULTI),
  exchangeMarketId: z.string().optional().nullable().default(null),
  singleMarketKind: z
    .nativeEnum(MarketKind)
    .optional()
    .nullable()
    .default(null),
  groups: z
    .array(GroupSchema)
    .min(1)
    .refine((gs) => new Set(gs.map((g) => g.key)).size === gs.length, {
      message: "Duplicate group keys are not allowed per bot.",
    })
    .refine(
      (gs) => gs.every((g) => g.key === GroupKey.A || g.key === GroupKey.B),
      {
        message: "Only A/B groups are supported.",
      }
    ),
});

const PayloadSchema = z.union([SingleBotSchema, MultiBotSchema]);

/** ---------- Helpers ---------- */
function badRequest(message: string, issues?: unknown) {
  return NextResponse.json(
    { ok: false, error: message, issues },
    { status: 400 }
  );
}

function toPrismaKnownError(
  e: unknown
): { code: string; meta?: Record<string, unknown> } | null {
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    return { code: e.code, meta: e.meta ?? undefined };
  }
  return null;
}

/** ---------- Types ---------- */
type CreatePayload = z.infer<typeof PayloadSchema> & {
  action: "create" | "update";
};
type UpdatePayload = CreatePayload & { id: string };

/** id 존재 여부 타입 가드(업데이트 전용으로 좁히기) */
function hasId(p: CreatePayload): p is UpdatePayload {
  return (
    typeof (p as { id?: unknown }).id === "string" &&
    (p as { id: string }).id.length > 0
  );
}

/** ---------- POST /api/bot-config ---------- */
export async function POST(req: NextRequest) {
  const maybeUserId = await getUserId(); // string | null
  if (!maybeUserId) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }
  const userId: string = maybeUserId;

  let jsonUnknown: unknown;
  try {
    jsonUnknown = await req.json();
  } catch {
    return badRequest("Invalid JSON body.");
  }

  const parsed = PayloadSchema.safeParse(jsonUnknown);
  if (!parsed.success) {
    return badRequest("Validation failed.", parsed.error.format());
  }
  const payload = parsed.data;

  // 모드별 가드
  if (payload.mode === BotMode.SINGLE) {
    if (!payload.exchangeMarketId)
      return badRequest("exchangeMarketId is required for SINGLE mode.");
    if (!payload.singleMarketKind)
      return badRequest("singleMarketKind is required for SINGLE mode.");
  } else {
    // MULTI에서는 싱글 전용 필드가 null/미포함이어야 함
    if (payload.exchangeMarketId != null) {
      return badRequest(
        "exchangeMarketId must be null/omitted for MULTI mode."
      );
    }
    if (payload.singleMarketKind != null) {
      return badRequest(
        "singleMarketKind must be null/omitted for MULTI mode."
      );
    }
  }

  try {
    if (payload.action === "update") {
      // ✅ 여기서 payload를 UpdatePayload로 좁힘
      if (!hasId(payload)) {
        return badRequest("id is required for update action.");
      }
      const updated = await updateBotWithConfig(userId, payload);
      return NextResponse.json({ ok: true, data: updated }, { status: 200 });
    } else {
      const created = await createBotWithConfig(userId, payload);
      return NextResponse.json({ ok: true, data: created }, { status: 201 });
    }
  } catch (e: unknown) {
    const known = toPrismaKnownError(e);
    if (known) {
      console.error("[bot-config] Prisma error:", known.code, known.meta);
      return NextResponse.json(
        { ok: false, error: "PrismaError", code: known.code, meta: known.meta },
        { status: 409 }
      );
    }
    console.error("[bot-config] Unknown error:", e);
    return NextResponse.json(
      { ok: false, error: "InternalError" },
      { status: 500 }
    );
  }
}

/** ---------- Core create/update ops ---------- */
async function createBotWithConfig(userId: string, payload: CreatePayload) {
  if (payload.mode === BotMode.SINGLE) {
    const bot = await prisma.tradingBot.create({
      data: {
        userId,
        name: payload.name,
        mode: BotMode.SINGLE,
        exchangeMarketId: payload.exchangeMarketId!, // validated
        singleMarketKind: payload.singleMarketKind!, // validated
        symbol: payload.symbol,
        strategyConfigId: payload.strategyConfigId,
        enabled: true,
      },
      include: { groups: true },
    });
    return bot;
  }

  return await prisma.$transaction(async (tx) => {
    const bot = await tx.tradingBot.create({
      data: {
        userId,
        name: payload.name,
        mode: BotMode.MULTI,
        exchangeMarketId: null,
        singleMarketKind: null,
        symbol: payload.symbol,
        strategyConfigId: payload.strategyConfigId,
        enabled: true,
      },
    });

    for (const g of payload.groups!) {
      const group = await tx.botGroup.create({
        data: { botId: bot.id, key: g.key },
      });
      for (const ex of g.exchanges) {
        await tx.botGroupExchange.create({
          data: {
            groupId: group.id,
            exchangeMarketId: ex.exchangeMarketId,
            allocationBps: ex.allocationBps,
            enabled: ex.enabled ?? true,
          },
        });
      }
    }

    return await tx.tradingBot.findUniqueOrThrow({
      where: { id: bot.id },
      include: { groups: { include: { exchanges: true } } },
    });
  });
}

async function updateBotWithConfig(userId: string, payload: UpdatePayload) {
  return await prisma.$transaction(async (tx) => {
    const existing = await tx.tradingBot.findUnique({
      where: { id: payload.id },
      include: { groups: { include: { exchanges: true } } },
    });
    if (!existing) {
      throw new Prisma.PrismaClientKnownRequestError("Not found", {
        code: "P2025",
        clientVersion: "N/A",
      } as unknown as Prisma.PrismaClientKnownRequestError);
    }

    if (existing.userId !== userId) {
      const err = new Error("Forbidden");
      (err as { status?: number }).status = 403;
      throw err;
    }

    const baseUpdated = await tx.tradingBot.update({
      where: { id: payload.id },
      data: {
        userId,
        name: payload.name,
        symbol: payload.symbol,
        strategyConfigId: payload.strategyConfigId,
        mode: payload.mode,
      },
    });

    if (payload.mode === BotMode.SINGLE) {
      if (existing.groups.length > 0) {
        await tx.botGroupExchange.deleteMany({
          where: { groupId: { in: existing.groups.map((g) => g.id) } },
        });
        await tx.botGroup.deleteMany({ where: { botId: existing.id } });
      }
      return await tx.tradingBot.update({
        where: { id: baseUpdated.id },
        data: {
          exchangeMarketId: payload.exchangeMarketId!, // validated
          singleMarketKind: payload.singleMarketKind!, // validated
        },
        include: { groups: true },
      });
    }

    await tx.tradingBot.update({
      where: { id: baseUpdated.id },
      data: { exchangeMarketId: null, singleMarketKind: null },
    });

    if (existing.groups.length > 0) {
      await tx.botGroupExchange.deleteMany({
        where: { groupId: { in: existing.groups.map((g) => g.id) } },
      });
      await tx.botGroup.deleteMany({ where: { botId: existing.id } });
    }

    for (const g of payload.groups!) {
      const group = await tx.botGroup.create({
        data: { botId: baseUpdated.id, key: g.key },
      });
      for (const ex of g.exchanges) {
        await tx.botGroupExchange.create({
          data: {
            groupId: group.id,
            exchangeMarketId: ex.exchangeMarketId,
            allocationBps: ex.allocationBps,
            enabled: ex.enabled ?? true,
          },
        });
      }
    }

    return await tx.tradingBot.findUniqueOrThrow({
      where: { id: baseUpdated.id },
      include: { groups: { include: { exchanges: true } } },
    });
  });
}

/** ---------- Optional: GET ---------- */
export async function GET() {
  return NextResponse.json({ ok: true, message: "bot-config API is up" });
}
