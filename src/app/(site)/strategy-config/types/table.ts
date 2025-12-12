// src/app/(site)/strategy-config/types/table.ts
//import type { StrategyItem } from "@/types/strategy-config";

import { StrategyItem } from ".";

export type StrategyRow = {
  idx: number;
  checked: boolean;
  updatedAt: string;
  name: string;
  kind: StrategyItem["kind"];
  detail: string;
};
