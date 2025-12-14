// src/types/bot-config/index.ts

// 백엔드 route.ts에서 사용하는 열거형과 페이로드를 프론트 전용 타입으로 재정의
export const BotMode = {
  SINGLE: "SINGLE",
  MULTI: "MULTI",
} as const;
export type BotMode = (typeof BotMode)[keyof typeof BotMode];

export const GroupKey = {
  A: "A",
  B: "B",
} as const;
export type GroupKey = (typeof GroupKey)[keyof typeof GroupKey];

export const MarketKind = {
  SPOT: "SPOT",
  FUTURES: "FUTURES",
} as const; // 실제 프로젝트 enum에 맞게 수정
export type MarketKind = (typeof MarketKind)[keyof typeof MarketKind];

export type ExchangeItemInput = {
  exchangeMarketId: string;
  allocationBps: number; // 0~10000
  enabled?: boolean; // default true
};

export type GroupInput = {
  key: GroupKey;
  exchanges: ExchangeItemInput[];
};

export type BaseBotInput = {
  id?: string; // update에서 사용
  action?: "create" | "update";
  // userId 제거 (백엔드에서 세션으로 주입)
  name: string;
  mode: BotMode;
  symbol: string;
  strategyConfigId: string;
};

export type SingleBotInput = BaseBotInput & {
  mode: typeof BotMode.SINGLE;
  exchangeMarketId: string;
  singleMarketKind: MarketKind;
  groups?: undefined;
};

export type MultiBotInput = BaseBotInput & {
  mode: typeof BotMode.MULTI;
  exchangeMarketId?: null;
  singleMarketKind?: null;
  groups: GroupInput[];
};

export type BotConfigPayload = SingleBotInput | MultiBotInput;

// 메타 데이터(셀렉트 옵션 로드용)
export type ExchangeMarketMeta = {
  id: string;
  exchangeName: string;
  marketName: string;
  symbol: string;
};

export type StrategyConfigMeta = {
  id: string;
  name: string;
};

export type ApiResponseOk<T> = {
  ok: true;
  data: T;
};

export type ApiResponseErr = {
  ok: false;
  error: string;
  code?: string;
  meta?: Record<string, unknown>;
  issues?: unknown;
};

export type ApiResponse<T> = ApiResponseOk<T> | ApiResponseErr;

/* =========================
   추가 타입 (훅 반환 타입 등)
   ========================= */

export type SubmitState = {
  submitting: boolean;
  error?: string;
  success?: boolean;
};

/**
 * useBotConfigForm 훅이 반환해야 하는 타입
 * - any / JSX.Element / React.ReactNode 사용 없음
 * - 렌더/연산 분리 전략에서 뷰는 이 타입에 의존하여 안전하게 접근
 */
export type UseBotConfigFormReturn = {
  // 상태 전환
  mode: BotMode;
  setModeSingle: () => void;
  setModeMulti: () => void;

  // 공통 (userId 제거)
  name: string;
  setName: (v: string) => void;

  symbol: string;
  setSymbol: (v: string) => void;

  strategyConfigId: string;
  setStrategyConfigId: (v: string) => void;

  // SINGLE
  exchangeMarketId: string;
  setExchangeMarketId: (v: string) => void;

  singleMarketKind: MarketKind;
  setSingleMarketKind: (v: MarketKind) => void;

  // MULTI (API payload 그대로)
  groupA: GroupInput;
  groupB: GroupInput;

  // MULTI (UI 전용: 거래소 이름 선택값)
  groupAExchangeNames: string[];
  groupBExchangeNames: string[];
  setRowExchangeName: (
    key: GroupKey,
    idx: number,
    exchangeName: string
  ) => void;

  // 행 조작
  addExchangeToGroup: (key: GroupKey) => void;
  updateExchangeRow: (
    key: GroupKey,
    idx: number,
    next: Partial<ExchangeItemInput>
  ) => void;
  removeExchangeRow: (key: GroupKey, idx: number) => void;

  // 제출
  composePayload: () => BotConfigPayload; // userId 미포함, 서버 주입
  validate: () => { ok: true } | { ok: false; message: string };
  submit: SubmitState;
  setSubmit: (s: SubmitState) => void;
};

/* =========================
   봇 리스트/상태 타입 추가
   ========================= */
export type BotStatus =
  | "RUNNING"
  | "STOPPED"
  | "STARTING"
  | "STOPPING"
  | "ERROR"
  | "UNKNOWN";

export type BotRow = {
  id: string;
  name: string;
  mode: "SINGLE" | "MULTI";
  symbol: string;
  enabled?: boolean;
  status?: BotStatus;

  /** 단건 GET 응답에서만 오는 DB 원본 상태 (옵셔널) */
  statusRaw?:
    | "STOPPED"
    | "STARTING"
    | "RUNNING"
    | "STOPPING"
    | "ERROR"
    | "UNKNOWN";
  /** 런타임 상태 최근 갱신 시각 (ISO8601) */
  statusUpdatedAt?: string;
};

// src/types/bots.ts
export interface BotListItem {
  id: string;
  name: string;
  mode: "SINGLE" | "MULTI";
  symbol: string;
  status: "RUNNING" | "STOPPED" | "STARTING" | "STOPPING" | "ERROR";
}
