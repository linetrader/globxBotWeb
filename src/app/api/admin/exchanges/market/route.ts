// src/app/api/admin/exchanges/market/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma";
import { requireAdmin } from "@/app/[locale]/admin/exchanges/list/gaurd/auth";
import {
  ExchangeMarketItemSchema,
  ExchangeMarketListResponseSchema,
  ExchangeMarketUpdateBodySchema,
  type ExchangeMarketItem,
  type ExchangeMarketListResponse,
  type ExchangeMarketUpdateBody,
  type ErrorResponse,
} from "@/app/[locale]/admin/exchanges/market/types";

export const runtime = "nodejs";

function jsonError(
  status: number,
  payload: ErrorResponse
): NextResponse<ErrorResponse> {
  return NextResponse.json(payload, { status });
}

export async function GET(): Promise<NextResponse> {
  try {
    await requireAdmin();

    const rows = await prisma.exchangeMarket.findMany({
      orderBy: [{ updatedAt: "desc" }],
      select: {
        id: true,
        exchangeId: true,
        exchange: { select: { code: true, name: true } },
        code: true,
        name: true,
        restBaseUrl: true,
        wsBaseUrl: true,
        active: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            bots: true,
            groupExchanges: true,
          },
        },
      },
    });

    const items: ExchangeMarketItem[] = rows.map((r) => ({
      id: r.id,
      exchangeId: r.exchangeId,
      exchangeCode: r.exchange.code,
      exchangeName: r.exchange.name,
      code: r.code,
      name: r.name ?? null,
      restBaseUrl: r.restBaseUrl,
      wsBaseUrl: r.wsBaseUrl ?? null,
      active: r.active,
      botsCount: r._count.bots,
      groupExchangesCount: r._count.groupExchanges,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));

    items.forEach((it) => ExchangeMarketItemSchema.parse(it));
    const body: ExchangeMarketListResponse = { items };
    ExchangeMarketListResponseSchema.parse(body);

    return NextResponse.json(body, { status: 200 });
  } catch (err) {
    if (err instanceof Error) {
      const msg = err.message;
      const status =
        msg === "Unauthorized" ? 401 : msg === "Forbidden" ? 403 : 500;
      return jsonError(status, { error: msg });
    }
    return jsonError(500, { error: "INTERNAL_ERROR" });
  }
}

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  try {
    await requireAdmin();

    const json = await req.json();
    const body: ExchangeMarketUpdateBody =
      ExchangeMarketUpdateBodySchema.parse(json);

    const toUpdate: {
      name?: string | null;
      restBaseUrl?: string;
      wsBaseUrl?: string | null;
      active?: boolean;
    } = {};

    if (body.name !== undefined)
      toUpdate.name = body.name.length ? body.name : "";
    if (body.restBaseUrl !== undefined) toUpdate.restBaseUrl = body.restBaseUrl;
    if (body.wsBaseUrl !== undefined)
      toUpdate.wsBaseUrl = body.wsBaseUrl.length ? body.wsBaseUrl : "";
    if (typeof body.active === "boolean") toUpdate.active = body.active;

    if (Object.keys(toUpdate).length === 0) {
      return jsonError(400, { error: "No updatable fields" });
    }

    const updated = await prisma.exchangeMarket.update({
      where: { id: body.id },
      data: toUpdate,
      select: {
        id: true,
        exchangeId: true,
        exchange: { select: { code: true, name: true } },
        code: true,
        name: true,
        restBaseUrl: true,
        wsBaseUrl: true,
        active: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { bots: true, groupExchanges: true },
        },
      },
    });

    const item: ExchangeMarketItem = {
      id: updated.id,
      exchangeId: updated.exchangeId,
      exchangeCode: updated.exchange.code,
      exchangeName: updated.exchange.name,
      code: updated.code,
      name: updated.name ?? null,
      restBaseUrl: updated.restBaseUrl,
      wsBaseUrl: updated.wsBaseUrl ?? null,
      active: updated.active,
      botsCount: updated._count.bots,
      groupExchangesCount: updated._count.groupExchanges,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
    ExchangeMarketItemSchema.parse(item);

    return NextResponse.json(item, { status: 200 });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      return jsonError(404, { error: "Not found" });
    }
    if (err instanceof Error) {
      const msg = err.message;
      const status =
        msg === "Unauthorized" ? 401 : msg === "Forbidden" ? 403 : 400;
      return jsonError(status, { error: msg });
    }
    return jsonError(500, { error: "INTERNAL_ERROR" });
  }
}
