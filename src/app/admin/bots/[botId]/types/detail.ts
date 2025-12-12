// src/app/admin/bots/[botId]/types/detail.ts

// 실행 상태/heartbeat/worker 등
export type ExecutionState = {
  runtimeStatus: "STOPPED" | "STARTING" | "RUNNING" | "STOPPING" | "ERROR";
  running: boolean;
  lastHeartbeatAt: string | null;
  workerId: string | null;
  workerTaskArn: string | null;
  workerLastHeartbeat: string | null;
  tickDriftSec: number | null;
  lastTickAt: string | null;
};

// 최근 틱(최근 실행)
export type RecentTick = {
  lastRunAt: string | null;
  lastResult: "SUCCESS" | "ERROR" | null;
  lastErrorMsg: string | null;
};

// 봇 설정 / 전략 파라미터
export type BotSettings = {
  mode: "SINGLE" | "MULTI";

  // SINGLE 모드일 때 symbol / exchange
  symbol: string | null;

  exchanges: {
    single: string | null; // SINGLE모드 exchangeCode
    A: string | null; // (멀티 대비 슬롯) 현재는 null
    B: string | null; // (멀티 대비 슬롯) 현재는 null
  };

  groupSymbols: {
    A: string | null; // 멀티 대비 슬롯 (현재 스키마에 없으면 null)
    B: string | null;
  };

  leverage: number | null;

  size: {
    defaultSize: number | null;
    maxSize: number | null;
  };

  martin: {
    useMartin: boolean | null;
    martinMultiplier: number | null;
  };

  strategyParams: {
    rsiLength: number | null;
    lowerTh: number | null;
    upperTh: number | null;

    bbwThresh: number | null;
    bbPeriod: number | null;
    bbK: number | null;

    trendFast: number | null;
    trendSlow: number | null;
    trendRsiUpperPullback: number | null;
    trendRsiLowerPullback: number | null;

    targetProfit: number | null;
  };
};

// 전체 상세
export type BotDetail = {
  botId: string;
  userId: string;
  username: string;
  name: string;
  mode: "SINGLE" | "MULTI";

  executionState: ExecutionState;
  recentTick: RecentTick;
  settings: BotSettings;
};

export type BotDetailResponseOk = {
  ok: true;
  data: BotDetail;
};

export type BotDetailResponseErr = {
  ok: false;
  error: string;
};

export type BotDetailResponse = BotDetailResponseOk | BotDetailResponseErr;
