// src/app/admin/bots/strategy/types/index.ts
export type StrategyGlobalDTO = {
  id: string;
  bbw_thresh: number;
  bb_period: number;
  bb_k: number;
  trend_fast: number;
  trend_slow: number;
  is_active: boolean;
  version: number;
  updated_at: string;
  created_at: string;
};

export type StrategyGlobalHistoryDTO = {
  id: string;
  settings_id: string;
  bbw_thresh: number;
  bb_period: number;
  bb_k: number;
  trend_fast: number;
  trend_slow: number;
  version: number;
  changed_at: string;
};

export type GetOk = {
  ok: true;
  data: {
    settings: StrategyGlobalDTO | null;
    history: StrategyGlobalHistoryDTO[];
  };
};

export type GetErr = { ok: false; error: string };
export type GetResponse = GetOk | GetErr;

export type SavePayload = {
  bbw_thresh: number;
  bb_period: number;
  bb_k: number;
  trend_fast: number;
  trend_slow: number;
};

export type SaveOk = { ok: true; data: StrategyGlobalDTO };
export type SaveErr = { ok: false; error: string };
export type SaveResponse = SaveOk | SaveErr;

export type UseStrategyReturn = {
  loading: boolean;
  saving: boolean;
  error: string | null;

  settings: StrategyGlobalDTO | null;
  history: StrategyGlobalHistoryDTO[];

  form: {
    bbw_thresh: string;
    bb_period: string;
    bb_k: string;
    trend_fast: string;
    trend_slow: string;
  };

  setField: (k: keyof SavePayload, v: string) => void;

  refresh: () => void;
  save: () => void;
};

// 공용 API 응답 제네릭
export type ApiResponse<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };
