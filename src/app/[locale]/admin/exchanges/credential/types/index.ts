// src/app/admin/exchanges/credential/types/index.ts
import { z } from "zod";

/** 리스트 아이템 */
export const ExchangeCredentialItemSchema = z.object({
  id: z.string().min(1),
  username: z.string().min(1), // ✅ userId → username
  exchangeId: z.string().min(1),
  exchangeCode: z.string().min(1),
  exchangeName: z.string().min(1),
  exchangeUid: z.string().nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type ExchangeCredentialItem = z.infer<
  typeof ExchangeCredentialItemSchema
>;

/** GET 응답 */
export const ExchangeCredentialListResponseSchema = z.object({
  items: z.array(ExchangeCredentialItemSchema),
});
export type ExchangeCredentialListResponse = z.infer<
  typeof ExchangeCredentialListResponseSchema
>;

/** PATCH 바디 (부분 업데이트: UID만) */
export const ExchangeCredentialUpdateBodySchema = z.object({
  id: z.string().min(1),
  exchangeUid: z.string().optional(), // 빈 문자열 허용 → 서버에서 null 처리
});
export type ExchangeCredentialUpdateBody = z.infer<
  typeof ExchangeCredentialUpdateBodySchema
>;

/** 공통 에러 응답 */
export type ErrorResponse = {
  error: string;
  details?: unknown;
};
