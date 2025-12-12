// src/app/api/admin/bots/strategy/types.ts
export type StrategyGlobal = {
  id: string;
  bbw_thresh: number;
  bb_period: number;
  bb_k: number;
  trend_fast: number;
  trend_slow: number;
  is_active: boolean;
  version: number;
  updated_at: Date;
  created_at: Date;
};

export type StrategyGlobalHistory = {
  id: string;
  settings_id: string;
  bbw_thresh: number;
  bb_period: number;
  bb_k: number;
  trend_fast: number;
  trend_slow: number;
  version: number;
  changed_at: Date;
};

export type StrategyUpdateInput = {
  bbw_thresh: number;
  bb_period: number;
  bb_k: number;
  trend_fast: number;
  trend_slow: number;
};
