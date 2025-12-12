// src/app/api/admin/bots/strategy/validation.ts
import { z } from "zod";
import type { StrategyUpdateInput } from "./types";

export const StrategyUpdateSchema: z.ZodType<StrategyUpdateInput> = z
  .object({
    bbw_thresh: z.number().gt(0),
    bb_period: z.number().int().min(2),
    bb_k: z.number().gte(1),
    trend_fast: z.number().int().min(1),
    trend_slow: z.number().int().min(1),
  })
  .refine((v) => v.trend_slow > v.trend_fast, {
    message: "trend_slow must be greater than trend_fast",
    path: ["trend_slow"],
  });
