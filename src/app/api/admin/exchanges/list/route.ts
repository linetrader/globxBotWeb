// src/app/api/admin/exchanges/list/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma";
import { requireAdmin } from "@/app/admin/exchanges/list/gaurd/auth";
import {
  ExchangeListItemSchema,
  ExchangeListResponseSchema,
  ExchangeUpdateBodySchema,
  type ExchangeListItem,
  type ExchangeListResponse,
  type ExchangeUpdateBody,
  type ErrorResponse,
} from "@/app/admin/exchanges/list/types";

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

    const rows = await prisma.exchange.findMany({
      orderBy: [{ updatedAt: "desc" }],
      select: {
        id: true,
        code: true,
        name: true,
        active: true,
        supportsFutures: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            markets: true,
            credentials: true,
          },
        },
      },
    });

    const items: ExchangeListItem[] = rows.map((r) => ({
      id: r.id,
      code: r.code,
      name: r.name,
      active: r.active,
      supportsFutures: r.supportsFutures,
      marketsCount: r._count.markets,
      credentialsCount: r._count.credentials,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));

    items.forEach((it) => ExchangeListItemSchema.parse(it));

    const body: ExchangeListResponse = { items };
    ExchangeListResponseSchema.parse(body);

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
    const body: ExchangeUpdateBody = ExchangeUpdateBodySchema.parse(json);

    const toUpdate: {
      name?: string;
      code?: string;
      active?: boolean;
      supportsFutures?: boolean;
    } = {};
    if (typeof body.name === "string") toUpdate.name = body.name;
    if (typeof body.code === "string") toUpdate.code = body.code;
    if (typeof body.active === "boolean") toUpdate.active = body.active;
    if (typeof body.supportsFutures === "boolean")
      toUpdate.supportsFutures = body.supportsFutures;

    if (Object.keys(toUpdate).length === 0) {
      return jsonError(400, { error: "No updatable fields" });
    }

    const updated = await prisma.exchange.update({
      where: { id: body.id },
      data: toUpdate,
      select: {
        id: true,
        code: true,
        name: true,
        active: true,
        supportsFutures: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { markets: true, credentials: true },
        },
      },
    });

    const item: ExchangeListItem = {
      id: updated.id,
      code: updated.code,
      name: updated.name,
      active: updated.active,
      supportsFutures: updated.supportsFutures,
      marketsCount: updated._count.markets,
      credentialsCount: updated._count.credentials,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
    ExchangeListItemSchema.parse(item);

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
