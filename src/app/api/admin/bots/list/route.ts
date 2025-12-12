// src/app/api/admin/bots/list/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { getUserId } from "@/lib/request-user";
import {
  collectAllDownlineIds,
  modeToString,
  runtimeToFlags,
} from "@/server/botControlService";
import type { Prisma } from "@/generated/prisma";

/**
 * 공통 select:
 *  - tradingBot 기본 정보
 *  - BotRuntime.status / workerId (현재 실행상태)
 *  - user.username (관리 UI에서 보여줄 닉네임)
 */
const listSelect = {
  id: true,
  userId: true,
  name: true,
  mode: true,
  BotRuntime: {
    select: {
      status: true,
      workerId: true,
    },
  },
  user: { select: { username: true } },
} as const;

/**
 * GET query 유효성 검증
 * page / pageSize / running / username
 *
 * running:
 *   - ALL
 *   - RUNNING
 *   - STOPPED
 *   - ERROR
 *
 * username:
 *   - 부분 일치 검색어 (""이면 필터 없음)
 */
const PageQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  running: z
    .enum(["ALL", "RUNNING", "STOPPED", "ERROR"])
    .optional()
    .default("ALL"),
  username: z.coerce.string().trim().default(""),
});

/**
 * GET /api/admin/bots/list
 * Query:
 *   - page
 *   - pageSize
 *   - running      ("ALL" | "RUNNING" | "STOPPED" | "ERROR")
 *   - username     (부분 일치 username 필터, optional)
 */
export async function GET(req: NextRequest) {
  const adminId = await getUserId();
  if (!adminId) {
    return NextResponse.json(
      { ok: false, error: "UNAUTHORIZED" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);

  const qp = PageQuerySchema.safeParse({
    page: searchParams.get("page"),
    pageSize: searchParams.get("pageSize"),
    running: searchParams.get("running") ?? undefined,
    username: searchParams.get("username") ?? "",
  });

  if (!qp.success) {
    return NextResponse.json(
      { ok: false, error: "INVALID_QUERY" },
      { status: 400 }
    );
  }

  const page = qp.data.page;
  const pageSize = qp.data.pageSize;
  const runningFilter = qp.data.running ?? "ALL"; // "ALL" | "RUNNING" | "STOPPED" | "ERROR"
  const usernameFilter = qp.data.username; // 부분 일치 검색어. ""면 필터 없음

  const skip = (page - 1) * pageSize;
  const take = pageSize;

  // 요청자(adminId) + 다운라인 전체 userId 목록
  const downlineSet = await collectAllDownlineIds(adminId);
  const allowedIds = [adminId, ...downlineSet];

  // 러닝 상태 필터에 따른 where
  // - RUNNING : BotRuntime.status ∈ ["RUNNING","STARTING"]
  // - STOPPED : BotRuntime.status ∈ ["STOPPED","STOPPING"] OR BotRuntime is null
  // - ERROR   : BotRuntime.status == "ERROR"
  // - ALL     : 제한 없음
  let runtimeWhere: Prisma.TradingBotWhereInput = {};

  if (runningFilter === "RUNNING") {
    runtimeWhere = {
      BotRuntime: {
        is: {
          status: { in: ["RUNNING", "STARTING"] },
        },
      },
    };
  } else if (runningFilter === "ERROR") {
    runtimeWhere = {
      BotRuntime: {
        is: {
          status: "ERROR",
        },
      },
    };
  } else if (runningFilter === "STOPPED") {
    runtimeWhere = {
      OR: [
        {
          BotRuntime: {
            is: {
              status: { in: ["STOPPED", "STOPPING"] },
            },
          },
        },
        { BotRuntime: { is: null } },
      ],
    };
  } // "ALL"은 제약 없음

  // usernameFilter 결합
  const baseWhere: Prisma.TradingBotWhereInput = {
    userId: { in: allowedIds },
    ...runtimeWhere,
  };

  const finalWhere: Prisma.TradingBotWhereInput =
    usernameFilter === ""
      ? baseWhere
      : {
          ...baseWhere,
          user: {
            username: {
              contains: usernameFilter,
              mode: "insensitive",
            },
          },
        };

  // total count
  const total = await prisma.tradingBot.count({ where: finalWhere });

  // 페이지 데이터
  const bots = await prisma.tradingBot.findMany({
    where: finalWhere,
    select: listSelect,
    orderBy: [
      { BotRuntime: { workerId: "asc" } },
      { userId: "asc" },
      { name: "asc" },
    ],
    skip,
    take,
  });

  // 응답 변환
  const data = bots.map((b) => {
    const st = runtimeToFlags(b.BotRuntime?.status ?? null);
    return {
      id: b.id,
      userId: b.userId,
      username: b.user?.username ?? b.userId,
      name: b.name,
      mode: modeToString(b.mode),
      status: st.status,
      running: st.running,
      workerId: b.BotRuntime?.workerId ?? null,
    };
  });

  return NextResponse.json({
    ok: true,
    data,
    page,
    pageSize,
    total,
  });
}
