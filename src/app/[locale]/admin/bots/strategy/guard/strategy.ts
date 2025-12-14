import { z } from "zod";
import type {
  GetResponse,
  SaveResponse,
  StrategyGlobalDTO,
  StrategyGlobalHistoryDTO,
} from "../types";

const StrategyDtoSchema = z.object({
  id: z.string().min(1),
  bbw_thresh: z.number(),
  bb_period: z.number().int(),
  bb_k: z.number(),
  trend_fast: z.number().int(),
  trend_slow: z.number().int(),
  is_active: z.boolean(),
  version: z.number().int(),
  updated_at: z.string(),
  created_at: z.string(),
});

const StrategyHistoryDtoSchema = z.object({
  id: z.string().min(1),
  settings_id: z.string().min(1),
  bbw_thresh: z.number(),
  bb_period: z.number().int(),
  bb_k: z.number(),
  trend_fast: z.number().int(),
  trend_slow: z.number().int(),
  version: z.number().int(),
  changed_at: z.string(),
});

const GetOkSchema = z.object({
  ok: z.literal(true),
  data: z.object({
    settings: StrategyDtoSchema.nullable(),
    history: z.array(StrategyHistoryDtoSchema),
  }),
});
const GetErrSchema = z.object({ ok: z.literal(false), error: z.string() });
const GetResponseSchema = z.union([GetOkSchema, GetErrSchema]);

export function parseGet(json: unknown): GetResponse {
  const r = GetResponseSchema.safeParse(json);
  if (!r.success) return { ok: false, error: "INVALID_RESPONSE" };
  return r.data as GetResponse;
}

const SaveOkSchema = z.object({ ok: z.literal(true), data: StrategyDtoSchema });
const SaveErrSchema = z.object({ ok: z.literal(false), error: z.string() });
const SaveResponseSchema = z.union([SaveOkSchema, SaveErrSchema]);

export function parseSave(json: unknown): SaveResponse {
  const r = SaveResponseSchema.safeParse(json);
  if (!r.success) return { ok: false, error: "INVALID_RESPONSE" };
  return r.data as SaveResponse;
}

// 런타임 타입 가드(필요시)
export function isStrategyDto(x: unknown): x is StrategyGlobalDTO {
  return StrategyDtoSchema.safeParse(x).success;
}
export function isStrategyHistoryDto(
  x: unknown
): x is StrategyGlobalHistoryDTO {
  return StrategyHistoryDtoSchema.safeParse(x).success;
}
