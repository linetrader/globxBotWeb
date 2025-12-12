// src/app/api/admin/bots/[botId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserId } from "@/lib/request-user";

/**
 * 런타임 상태 문자열에서 표시용 status / running 플래그 파생
 * BotStatus enum과 동일하게 동작한다고 가정:
 *  "STOPPED" | "STARTING" | "RUNNING" | "STOPPING" | "ERROR" ...
 */
function runtimeToFlags(status: string | null | undefined) {
  const s = (status ?? "STOPPED") as
    | "STOPPED"
    | "STARTING"
    | "RUNNING"
    | "STOPPING"
    | "ERROR";

  const running = s === "RUNNING" || s === "STARTING";

  return {
    status: s,
    running,
  };
}

/**
 * 주어진 userId의 모든 다운라인(하위 추천인) userId를 재귀적으로 모은다.
 * (admin이 자기/다운라인 유저의 봇만 볼 수 있게 하기 위함)
 */
async function collectAllDownlineIds(rootUserId: string): Promise<Set<string>> {
  const visited = new Set<string>();
  let frontier: string[] = [rootUserId];

  const MAX_DEPTH = 20;
  const TAKE_PER_ROUND = 5000;

  for (let depth = 0; depth < MAX_DEPTH && frontier.length > 0; depth++) {
    const edges = await prisma.referralEdge.findMany({
      where: { parentId: { in: frontier } },
      select: { childId: true },
      take: TAKE_PER_ROUND,
    });

    if (edges.length === 0) break;

    const next: string[] = [];
    for (const e of edges) {
      if (!visited.has(e.childId)) {
        visited.add(e.childId);
        next.push(e.childId);
      }
    }

    frontier = next;
  }

  return visited;
}

/**
 * 최근 워크 실행(WorkAttempt 1건)을 화면에 보여주기 좋게 정리
 */
function summarizeAttempt(
  attempt: {
    startedAt: Date;
    finishedAt: Date | null;
    exitCode: number | null;
    error: string | null;
    workItem: {
      status: string;
    } | null;
  } | null
) {
  if (!attempt) {
    return {
      lastRunAt: null,
      completedAt: null,
      result: null as "SUCCESS" | "ERROR" | null,
      exitCode: null as number | null,
      lastErrorMsg: null as string | null,
    };
  }

  // "성공"이라고 볼 기준:
  //  - workItem.status === "SUCCEEDED"
  //  - exitCode === 0
  //  - error == null
  let result: "SUCCESS" | "ERROR" = "ERROR";
  if (
    attempt.workItem?.status === "SUCCEEDED" &&
    attempt.exitCode === 0 &&
    attempt.error == null
  ) {
    result = "SUCCESS";
  }

  return {
    lastRunAt: attempt.startedAt ?? null,
    completedAt: attempt.finishedAt ?? null,
    result,
    exitCode: attempt.exitCode ?? null,
    lastErrorMsg: attempt.error ?? null,
  };
}

/**
 * GET /api/admin/bots/[botId]
 *
 * 주의: App Router 환경에서는 ctx.params 가 Promise일 수 있으므로 await 필요
 */
export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ botId: string }> }
) {
  // 0. 인증 확인
  const adminId = await getUserId();
  if (!adminId) {
    return NextResponse.json(
      { ok: false, error: "UNAUTHORIZED" },
      { status: 401 }
    );
  }

  // 1. 파라미터 취득
  const { botId } = await ctx.params;
  if (!botId) {
    return NextResponse.json(
      { ok: false, error: "MISSING_BOT_ID" },
      { status: 400 }
    );
  }

  // 2. 접근 가능한 userId 집합 (나 + 내 다운라인)
  const downlineSet = await collectAllDownlineIds(adminId);
  const allowedUserIds = new Set<string>([adminId, ...downlineSet]);

  // 3. 봇 본체 (TradingBot)
  //    - 여기선 전체 레코드를 받아서 필요한 필드만 사용
  const bot = await prisma.tradingBot.findUnique({
    where: { id: botId },
  });

  if (!bot) {
    return NextResponse.json(
      { ok: false, error: "BOT_NOT_FOUND" },
      { status: 404 }
    );
  }

  // 권한 확인
  if (!allowedUserIds.has(bot.userId)) {
    return NextResponse.json(
      { ok: false, error: "FORBIDDEN" },
      { status: 403 }
    );
  }

  // 4. 부가 데이터 조회들 병렬로 긁어오기
  const [
    // 봇 실행 상태 (BotRuntime)
    runtime,
    // 유저 (username)
    user,
    // 전략 설정 (StrategyConfig + TrendStrategy + BoxStrategy)
    strategyCfg,
    // 글로벌 파라미터 (StrategyGlobalSettings - is_active = true 중 최신)
    globalSettings,
    // 싱글 마켓/거래소 정보
    exchangeMarket,
    // 그룹(멀티 모드일 때 A/B 그룹과 연결된 거래소들)
    groupsRaw,
    // 최근 작업 시도(WorkAttempt)
    lastAttempt,
  ] = await Promise.all([
    prisma.botRuntime.findUnique({
      where: { botId },
      select: {
        status: true,
        pid: true,
        queueJobId: true,
        startedAt: true,
        stoppedAt: true,
        lastHeartbeat: true,
        lastTickAt: true,
        userTickSec: true,
        tickDriftSec: true,
        lastError: true,
        workerTaskArn: true,
        workerRevision: true,
        desiredState: true,
        workerId: true,
        worker: {
          select: {
            id: true,
            taskArn: true,
            lastHeartbeat: true,
          },
        },
      },
    }),

    prisma.user.findUnique({
      where: { id: bot.userId },
      select: { username: true },
    }),

    prisma.strategyConfig.findUnique({
      where: { id: bot.strategyConfigId },
      select: {
        useMartin: true,
        martinMultiplier: true,
        defaultSize: true,
        maxSize: true,
        targetProfit: true,
        leverage: true,
        timeframe: true,
        enabled: true,
        rsiLength: true,

        trend: {
          select: {
            trendRsiUpperPullback: true,
            trendRsiLowerPullback: true,
          },
        },
        box: {
          select: {
            lowerTh: true,
            upperTh: true,
            boxTouchPct: true,
          },
        },
      },
    }),

    prisma.strategyGlobalSettings.findFirst({
      where: { is_active: true },
      orderBy: { updated_at: "desc" },
      select: {
        bbw_thresh: true,
        bb_period: true,
        bb_k: true,
        trend_fast: true,
        trend_slow: true,
      },
    }),

    bot.exchangeMarketId
      ? prisma.exchangeMarket.findUnique({
          where: { id: bot.exchangeMarketId },
          select: {
            code: true,
            exchange: {
              select: {
                code: true, // "GATEIO", "WEBSEA", ...
              },
            },
          },
        })
      : Promise.resolve(null),

    prisma.botGroup.findMany({
      where: { botId: bot.id },
      select: {
        key: true, // 'A' | 'B'
        exchanges: {
          where: { enabled: true },
          orderBy: { updatedAt: "desc" },
          take: 1, // 우선 하나만 보여줄게
          select: {
            exchangeMarket: {
              select: {
                code: true, // "SPOT" | "FUTURES"...
                exchange: {
                  select: {
                    code: true, // "GATEIO"/"WEBSEA" 등
                  },
                },
              },
            },
            enabled: true,
          },
        },
      },
    }),

    prisma.workAttempt.findFirst({
      where: {
        workItem: {
          botId: botId,
        },
      },
      orderBy: { startedAt: "desc" },
      select: {
        startedAt: true,
        finishedAt: true,
        exitCode: true,
        error: true,
        workItem: {
          select: {
            status: true,
          },
        },
      },
    }),
  ]);

  // 5. recentTick 요약
  const recentTick = summarizeAttempt(
    lastAttempt
      ? {
          startedAt: lastAttempt.startedAt,
          finishedAt: lastAttempt.finishedAt ?? null,
          exitCode: lastAttempt.exitCode ?? null,
          error: lastAttempt.error ?? null,
          workItem: lastAttempt.workItem
            ? {
                status: lastAttempt.workItem.status,
              }
            : null,
        }
      : null
  );

  // 6. 런타임 상태 가공
  const flags = runtimeToFlags(runtime?.status);

  // worker heartbeat: 우선순위 worker.lastHeartbeat > runtime.lastHeartbeat
  const workerLastHeartbeat =
    runtime?.worker?.lastHeartbeat ?? runtime?.lastHeartbeat ?? null;

  // 7. 멀티 그룹(exchange code 등) 정리
  //    groupsRaw: [{ key: 'A', exchanges: [{ exchangeMarket: { code, exchange:{code}} }] }, ...]
  //    제일 최근 enabled된 것 1개만 봐서 "그룹 A는 어떤 거래소?" 식으로 매핑
  let groupExchangeA: string | null = null;
  let groupExchangeB: string | null = null;

  for (const g of groupsRaw) {
    const firstEx = g.exchanges[0];
    const exchCode = firstEx?.exchangeMarket?.exchange?.code ?? null; // "GATEIO" 같은 거래소 코드

    if (g.key === "A") {
      groupExchangeA = exchCode;
    } else if (g.key === "B") {
      groupExchangeB = exchCode;
    }
  }

  // 8. settings(봇 설정 / 전략 파라미터)
  //    SINGLE인 경우: symbol + exchangeMarket 기준 거래소 코드
  //    MULTI인 경우: groups 기반으로 A/B 각각 대표 거래소 코드
  const settings = {
    mode: bot.mode === "MULTI" ? "MULTI" : "SINGLE",

    // 공통 심볼
    symbol: bot.symbol ?? null,

    // 어떤 거래소/마켓에 붙어있는지 표시용
    exchanges:
      bot.mode === "MULTI"
        ? {
            single: null,
            A: groupExchangeA ?? null,
            B: groupExchangeB ?? null,
          }
        : {
            single: exchangeMarket?.exchange?.code ?? null /* ex. "GATEIO" */,
            A: null,
            B: null,
          },

    // 멀티모드면 그룹별 심볼 등도 필요할 수도. 현재 TradingBot엔 전역 symbol만 있고
    // 그룹별 심볼은 별도 필드가 없으므로 placeholder 유지
    groupSymbols: {
      A: null,
      B: null,
    },

    leverage: strategyCfg?.leverage ?? null,

    size: {
      defaultSize: strategyCfg?.defaultSize ?? null,
      maxSize: strategyCfg?.maxSize ?? null,
    },

    martin: {
      useMartin: strategyCfg?.useMartin ?? null,
      martinMultiplier: strategyCfg?.martinMultiplier ?? null,
    },

    strategyParams: {
      // RSI
      rsiLength: strategyCfg?.rsiLength ?? null,

      // Box 전략 기준 하한/상한
      lowerTh: strategyCfg?.box?.lowerTh ?? null,
      upperTh: strategyCfg?.box?.upperTh ?? null,

      // 글로벌 인디케이터(볼린저/밴드폭 등)
      bbwThresh: globalSettings ? Number(globalSettings.bbw_thresh) : null,
      bbPeriod: globalSettings?.bb_period ?? null,
      bbK: globalSettings ? Number(globalSettings.bb_k) : null,

      // 글로벌 트렌드 파라미터
      trendFast: globalSettings?.trend_fast ?? null,
      trendSlow: globalSettings?.trend_slow ?? null,

      // Trend 전략 전용 pullback
      trendRsiUpperPullback: strategyCfg?.trend?.trendRsiUpperPullback ?? null,
      trendRsiLowerPullback: strategyCfg?.trend?.trendRsiLowerPullback ?? null,

      // 목표 이익률 (%)
      targetProfit: strategyCfg?.targetProfit ?? null,
    },
  };

  // 9. 실행 상태 블럭
  const executionState = {
    runtimeStatus: flags.status,
    running: flags.running,

    lastHeartbeatAt: runtime?.lastHeartbeat ?? null,
    lastTickAt: runtime?.lastTickAt ?? null,

    workerId: runtime?.workerId ?? null,
    workerTaskArn: runtime?.workerTaskArn ?? null,

    workerLastHeartbeat, // 가공한 값
    tickDriftSec: runtime?.tickDriftSec ?? null,
  };

  // 10. 최종 detail 응답
  const detail = {
    botId: bot.id,
    userId: bot.userId,
    username: user?.username ?? bot.userId,
    name: bot.name,
    mode: bot.mode === "MULTI" ? "MULTI" : "SINGLE",

    executionState,
    recentTick,
    settings,
  };

  return NextResponse.json({ ok: true, data: detail });
}
