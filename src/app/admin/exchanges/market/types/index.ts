// src/app/admin/exchanges/market/types/index.ts
import { z } from "zod";

/** 리스트 아이템 */
export const ExchangeMarketItemSchema = z.object({
  id: z.string().min(1),
  exchangeId: z.string().min(1),
  exchangeCode: z.string().min(1),
  exchangeName: z.string().min(1),
  code: z.string().min(1), // "SPOT" | "FUTURES" ...
  name: z.string().nullable(), // Prisma 필드 name? -> null 가능
  restBaseUrl: z.string().min(1),
  wsBaseUrl: z.string().nullable(),
  active: z.boolean(),
  botsCount: z.number().int().nonnegative(),
  groupExchangesCount: z.number().int().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type ExchangeMarketItem = z.infer<typeof ExchangeMarketItemSchema>;

/** GET 응답 */
export const ExchangeMarketListResponseSchema = z.object({
  items: z.array(ExchangeMarketItemSchema),
});
export type ExchangeMarketListResponse = z.infer<
  typeof ExchangeMarketListResponseSchema
>;

/** PATCH 바디 (부분 업데이트) */
export const ExchangeMarketUpdateBodySchema = z.object({
  id: z.string().min(1),
  active: z.boolean().optional(),
  name: z.string().optional(), // "" 허용(빈 문자열로 저장할지 정책에 맞게)
  restBaseUrl: z.string().optional(),
  wsBaseUrl: z.string().optional(),
});
export type ExchangeMarketUpdateBody = z.infer<
  typeof ExchangeMarketUpdateBodySchema
>;

/** 공통 에러 응답 */
export type ErrorResponse = {
  error: string;
  details?: unknown;
};
