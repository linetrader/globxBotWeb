// src/app/admin/bots/work-queue/gaurd/workItems.ts
import {
  WorkQueueListResponse,
  WorkQueueRow,
  CleanupResponse,
} from "../types/list";

function isString(v: unknown): v is string {
  return typeof v === "string";
}
function isNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}
function isNullableString(v: unknown): v is string | null {
  return v === null || typeof v === "string";
}
function isNullableNumber(v: unknown): v is number | null {
  return v === null || (typeof v === "number" && Number.isFinite(v));
}

// 서버 한 row를 안전한 WorkQueueRow 로 변환
function parseRow(raw: unknown): WorkQueueRow | null {
  if (typeof raw !== "object" || raw === null) return null;
  const obj = raw as Record<string, unknown>;

  if (
    !isString(obj.id) ||
    !isString(obj.userId) ||
    !isNullableString(obj.username) ||
    !isNullableString(obj.botId) ||
    !isNullableString(obj.botName) ||
    !isString(obj.type) ||
    !isString(obj.status) ||
    !isNumber(obj.attempts) ||
    !isNullableString(obj.dedupeKey) ||
    !isNullableString(obj.sqsGroupId) ||
    !isString(obj.createdAt) ||
    !isString(obj.updatedAt) ||
    !isNullableString(obj.lastAttemptStartedAt) ||
    !isNullableString(obj.lastAttemptFinishedAt) ||
    !isNullableNumber(obj.lastAttemptExitCode) ||
    !isNullableString(obj.lastAttemptError) ||
    !isNullableString(obj.lastAttemptWorkerTaskArn) ||
    !isNullableNumber(obj.queueDelaySec)
  ) {
    return null;
  }

  return {
    id: obj.id,
    userId: obj.userId,
    username: obj.username,
    botId: obj.botId,
    botName: obj.botName,
    type: obj.type,
    status: obj.status,
    attempts: obj.attempts,
    dedupeKey: obj.dedupeKey,
    sqsGroupId: obj.sqsGroupId,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
    lastAttemptStartedAt: obj.lastAttemptStartedAt,
    lastAttemptFinishedAt: obj.lastAttemptFinishedAt,
    lastAttemptExitCode: obj.lastAttemptExitCode,
    lastAttemptError: obj.lastAttemptError,
    lastAttemptWorkerTaskArn: obj.lastAttemptWorkerTaskArn,
    queueDelaySec: obj.queueDelaySec,
  };
}

// 목록 API 응답 파싱
export function parseListResponse(
  raw: unknown
):
  | { ok: true; data: WorkQueueRow[]; total: number }
  | { ok: false; error: string } {
  const body = raw as WorkQueueListResponse;
  if (!body || typeof body !== "object") {
    return { ok: false, error: "INVALID_RESPONSE" };
  }
  if (body.ok === true) {
    if (!Array.isArray(body.data) || typeof body.total !== "number") {
      return { ok: false, error: "INVALID_RESPONSE_SHAPE" };
    }
    const rows: WorkQueueRow[] = [];
    for (const r of body.data) {
      const parsed = parseRow(r);
      if (!parsed) {
        return { ok: false, error: "INVALID_ROW" };
      }
      rows.push(parsed);
    }
    return { ok: true, data: rows, total: body.total };
  }

  if (body.ok === false) {
    if (typeof body.error === "string") {
      return { ok: false, error: body.error };
    }
    return { ok: false, error: "UNKNOWN_ERROR" };
  }

  return { ok: false, error: "UNKNOWN_ERROR" };
}

// cleanup API 응답 파싱
export function parseCleanupResponse(
  raw: unknown
):
  | { ok: true; deleted: number; cutoffIso: string }
  | { ok: false; error: string } {
  const body = raw as CleanupResponse;
  if (!body || typeof body !== "object") {
    return { ok: false, error: "INVALID_RESPONSE" };
  }

  if (body.ok === true) {
    if (
      typeof body.deleted === "number" &&
      typeof body.cutoffIso === "string"
    ) {
      return {
        ok: true,
        deleted: body.deleted,
        cutoffIso: body.cutoffIso,
      };
    }
    return { ok: false, error: "INVALID_RESPONSE_SHAPE" };
  }

  if (body.ok === false) {
    if (typeof body.error === "string") {
      return { ok: false, error: body.error };
    }
    return { ok: false, error: "UNKNOWN_ERROR" };
  }

  return { ok: false, error: "UNKNOWN_ERROR" };
}
