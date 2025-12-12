import { z } from "zod";

/** 개별 아이템 타입 */
export const ExchangeListItemSchema = z.object({
  id: z.string().min(1),
  code: z.string().min(1),
  name: z.string().min(1),
  active: z.boolean(),
  supportsFutures: z.boolean(),
  marketsCount: z.number().int().nonnegative(),
  credentialsCount: z.number().int().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type ExchangeListItem = z.infer<typeof ExchangeListItemSchema>;

/** GET 응답 */
export const ExchangeListResponseSchema = z.object({
  items: z.array(ExchangeListItemSchema),
});
export type ExchangeListResponse = z.infer<typeof ExchangeListResponseSchema>;

/** PATCH 바디 (토글 업데이트) */
export const ExchangeUpdateBodySchema = z.object({
  id: z.string().min(1),
  active: z.boolean().optional(),
  supportsFutures: z.boolean().optional(),
  name: z.string().min(1).optional(),
  code: z.string().min(1).optional(),
});
export type ExchangeUpdateBody = z.infer<typeof ExchangeUpdateBodySchema>;

/** 공통 에러 */
export type ErrorResponse = {
  error: string;
  details?: unknown;
};
