// src/app/admin/bots/list/gaurd/bots.ts
import { z } from "zod";
import type {
  BotRow,
  BulkAction,
  BulkUpdatePayload,
  BulkUpdateResponse,
  ListResponse,
  RuntimeStatus,
  BackupStopResponse,
  RestoreStartResponse,
} from "../types";

export const RuntimeStatusSchema = z.union([
  z.literal("STOPPED"),
  z.literal("STARTING"),
  z.literal("RUNNING"),
  z.literal("STOPPING"),
  z.literal("ERROR"),
]);

export const BotRowSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  username: z.string().min(1),
  name: z.string().min(1),
  mode: z.union([z.literal("SINGLE"), z.literal("MULTI")]),

  status: RuntimeStatusSchema,
  running: z.boolean(),

  workerId: z.string().min(1).nullable(), // null 허용
});

export const ListOkSchema = z.object({
  ok: z.literal(true),
  data: z.array(BotRowSchema),
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1),
  total: z.number().int().min(0),
});

export const ListErrSchema = z.object({
  ok: z.literal(false),
  error: z.string(),
});

export const ListResponseSchema = z.union([ListOkSchema, ListErrSchema]);

export function parseList(json: unknown): ListResponse {
  const r = ListResponseSchema.safeParse(json);
  if (!r.success) return { ok: false, error: "INVALID_RESPONSE" };
  return r.data;
}

export const BulkActionSchema: z.ZodType<BulkAction> = z.union([
  z.literal("START"),
  z.literal("STOP"),
]);

export const BulkUpdatePayloadSchema: z.ZodType<BulkUpdatePayload> = z.object({
  action: BulkActionSchema,
  botIds: z.array(z.string().min(1)).min(1),
});

export const BulkUpdateOkSchema = z.object({
  ok: z.literal(true),
  data: z.object({ updated: z.number().int().nonnegative() }),
});

export const BulkUpdateErrSchema = z.object({
  ok: z.literal(false),
  error: z.string(),
});

export const BulkUpdateResponseSchema: z.ZodType<BulkUpdateResponse> = z.union([
  BulkUpdateOkSchema,
  BulkUpdateErrSchema,
]);

export function parseBulkUpdate(json: unknown): BulkUpdateResponse {
  const r = BulkUpdateResponseSchema.safeParse(json);
  if (!r.success) return { ok: false, error: "INVALID_RESPONSE" };
  return r.data;
}

export function isBotRow(x: unknown): x is BotRow {
  return BotRowSchema.safeParse(x).success;
}

export function isRuntimeStatus(x: unknown): x is RuntimeStatus {
  return RuntimeStatusSchema.safeParse(x).success;
}

/** Backup+Stop 파서 */
const BackupStopOkSchema = z.object({
  ok: z.literal(true),
  backupId: z.string().min(1),
  count: z.number().int().nonnegative(),
  stopped: z.object({
    updated: z.number().int().nonnegative(),
    requested: z.number().int().nonnegative(),
    eligible: z.number().int().nonnegative(),
  }),
});
const BackupStopErrSchema = z.object({
  ok: z.literal(false),
  error: z.string(),
});
const BackupStopResponseSchema = z.union([
  BackupStopOkSchema,
  BackupStopErrSchema,
]);
export function parseBackupStop(json: unknown): BackupStopResponse {
  const r = BackupStopResponseSchema.safeParse(json);
  if (!r.success) return { ok: false, error: "INVALID_RESPONSE" };
  return r.data;
}

/** Restore-Start 파서 */
const RestoreStartOkSchema = z.object({
  ok: z.literal(true),
  backupId: z.string().min(1),
  total: z.number().int().nonnegative(),
  started: z.object({
    updated: z.number().int().nonnegative(),
    requested: z.number().int().nonnegative(),
    eligible: z.number().int().nonnegative(),
  }),
});
const RestoreStartErrSchema = z.object({
  ok: z.literal(false),
  error: z.string(),
});
const RestoreStartResponseSchema = z.union([
  RestoreStartOkSchema,
  RestoreStartErrSchema,
]);
export function parseRestoreStart(json: unknown): RestoreStartResponse {
  const r = RestoreStartResponseSchema.safeParse(json);
  if (!r.success) return { ok: false, error: "INVALID_RESPONSE" };
  return r.data;
}
