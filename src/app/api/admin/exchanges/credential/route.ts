// src/app/api/admin/exchanges/credential/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma";
import { requireAdmin } from "@/app/[locale]/admin/exchanges/list/gaurd/auth";
import { getUserId } from "@/lib/request-user";
import {
  ExchangeCredentialItemSchema,
  ExchangeCredentialListResponseSchema,
  ExchangeCredentialUpdateBodySchema,
  type ExchangeCredentialItem,
  type ExchangeCredentialListResponse,
  type ExchangeCredentialUpdateBody,
  type ErrorResponse,
} from "@/app/[locale]/admin/exchanges/credential/types";

export const runtime = "nodejs";

function jsonError(
  status: number,
  payload: ErrorResponse
): NextResponse<ErrorResponse> {
  return NextResponse.json(payload, { status });
}

/**
 * adminId를 루트로 하여 "모든" 하위(산하) userId를 BFS로 수집
 */
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

    const nextLevel: string[] = [];
    for (const e of edges) {
      const child = e.childId;
      if (!visited.has(child)) {
        visited.add(child);
        nextLevel.push(child);
      }
    }
    frontier = nextLevel;
  }
  // root 제외 (visited에는 자식들만)
  return visited;
}

export async function GET(): Promise<NextResponse> {
  try {
    await requireAdmin();

    const adminId = await getUserId();
    if (!adminId) {
      return jsonError(401, { error: "Unauthorized" });
    }

    // ✅ 산하(모든 레벨) 수집 + 본인 포함
    const downlineSet = await collectAllDownlineIds(adminId);
    const allowedIdsSet = new Set<string>([adminId, ...downlineSet]);
    const allowedIds = Array.from(allowedIdsSet);

    // 산하가 전혀 없을 수도 있으니 빈 배열 허용
    const rows = await prisma.exchangeCredential.findMany({
      where: { user: { id: { in: allowedIds } } },
      orderBy: [{ updatedAt: "desc" }],
      select: {
        id: true,
        user: { select: { id: true, username: true } },
        exchangeId: true,
        exchange: { select: { code: true, name: true } },
        exchangeUid: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const items: ExchangeCredentialItem[] = rows.map((r) => ({
      id: r.id,
      username: r.user.username,
      exchangeId: r.exchangeId,
      exchangeCode: r.exchange.code,
      exchangeName: r.exchange.name,
      exchangeUid: r.exchangeUid ?? null,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));

    items.forEach((it) => ExchangeCredentialItemSchema.parse(it));
    const body: ExchangeCredentialListResponse = { items };
    ExchangeCredentialListResponseSchema.parse(body);

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

    const adminId = await getUserId();
    if (!adminId) {
      return jsonError(401, { error: "Unauthorized" });
    }

    const json = await req.json();
    const body: ExchangeCredentialUpdateBody =
      ExchangeCredentialUpdateBodySchema.parse(json);

    // ✅ 산하(모든 레벨) + 본인 허용
    const downlineSet = await collectAllDownlineIds(adminId);
    const allowedIdsSet = new Set<string>([adminId, ...downlineSet]);

    // 수정 대상 크리덴셜 조회 (소유자 확인용)
    const target = await prisma.exchangeCredential.findUnique({
      where: { id: body.id },
      select: { id: true, user: { select: { id: true } } },
    });

    if (!target) {
      return jsonError(404, { error: "Not found" });
    }
    if (!allowedIdsSet.has(target.user.id)) {
      return jsonError(403, { error: "Forbidden" });
    }

    const toUpdate: { exchangeUid?: string | null } = {};
    if (body.exchangeUid !== undefined) {
      toUpdate.exchangeUid = body.exchangeUid.trim().length
        ? body.exchangeUid
        : null;
    }
    if (Object.keys(toUpdate).length === 0) {
      return jsonError(400, { error: "No updatable fields" });
    }

    const updated = await prisma.exchangeCredential.update({
      where: { id: body.id },
      data: toUpdate,
      select: {
        id: true,
        user: { select: { username: true } },
        exchangeId: true,
        exchange: { select: { code: true, name: true } },
        exchangeUid: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const item: ExchangeCredentialItem = {
      id: updated.id,
      username: updated.user.username,
      exchangeId: updated.exchangeId,
      exchangeCode: updated.exchange.code,
      exchangeName: updated.exchange.name,
      exchangeUid: updated.exchangeUid ?? null,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
    ExchangeCredentialItemSchema.parse(item);

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
