// src/app/admin/process/list/gaurd/process.ts
import type {
  ProcessRow,
  ProcessListResponse,
  BulkDeleteResponse,
  StopAllResponse,
} from "../types";

function isString(v: unknown): v is string {
  return typeof v === "string";
}

function isNullableString(v: unknown): v is string | null {
  return v === null || typeof v === "string";
}

function isNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

function isBoolean(v: unknown): v is boolean {
  return typeof v === "boolean";
}

function isStringArray(v: unknown): v is string[] {
  if (!Array.isArray(v)) {
    return false;
  }
  for (const item of v) {
    if (typeof item !== "string") {
      return false;
    }
  }
  return true;
}

function parseRow(raw: unknown): ProcessRow | null {
  if (typeof raw !== "object" || raw === null) {
    return null;
  }

  const o = raw as Record<string, unknown>;

  const idOk = isString(o.id) && o.id.length > 0;
  const taskArnOk = isNullableString(o.taskArn);
  const revisionOk = isNullableString(o.revision);
  const createdAtOk = isString(o.createdAt) && o.createdAt.length > 0;
  const lastHeartbeatOk = isNullableString(o.lastHeartbeat);
  const updatedAtOk = isString(o.updatedAt) && o.updatedAt.length > 0;
  const botCountOk = isNumber(o.botCount) && o.botCount >= 0;
  const aliveOk = isBoolean(o.alive);

  // 추가 필드들
  const conflictOk = isStringArray(o.conflictBotIds ?? []);
  const zombieOk = isBoolean(
    o.isZombieSuspect === undefined ? false : o.isZombieSuspect
  );

  if (
    !idOk ||
    !taskArnOk ||
    !revisionOk ||
    !createdAtOk ||
    !lastHeartbeatOk ||
    !updatedAtOk ||
    !botCountOk ||
    !aliveOk ||
    !conflictOk ||
    !zombieOk
  ) {
    return null;
  }

  return {
    id: o.id as string,
    taskArn: (o.taskArn as string | null) ?? null,
    revision: (o.revision as string | null) ?? null,
    createdAt: o.createdAt as string,
    lastHeartbeat: (o.lastHeartbeat as string | null) ?? null,
    updatedAt: o.updatedAt as string,
    botCount: o.botCount as number,
    alive: o.alive as boolean,
    conflictBotIds: (o.conflictBotIds as string[]) ?? [],
    isZombieSuspect: (o.isZombieSuspect as boolean) ?? false,
  };
}

export function parseProcessListResponse(raw: unknown): ProcessListResponse {
  if (typeof raw === "object" && raw !== null) {
    const o = raw as Record<string, unknown>;

    if (o.ok === false) {
      const err =
        typeof o.error === "string" && o.error.length > 0
          ? o.error
          : "UNKNOWN_ERROR";

      return {
        ok: false,
        error: err,
      };
    }

    if (o.ok === true) {
      const dataRaw = o.data;
      const pageRaw = o.page;
      const pageSizeRaw = o.pageSize;
      const totalRaw = o.total;

      if (
        Array.isArray(dataRaw) &&
        isNumber(pageRaw) &&
        isNumber(pageSizeRaw) &&
        isNumber(totalRaw)
      ) {
        const rows: ProcessRow[] = [];

        for (const item of dataRaw) {
          const row = parseRow(item);
          if (row) {
            rows.push(row);
          }
        }

        return {
          ok: true,
          data: rows,
          page: pageRaw,
          pageSize: pageSizeRaw,
          total: totalRaw,
        };
      }
    }
  }

  return {
    ok: false,
    error: "INVALID_RESPONSE",
  };
}

export function parseBulkDeleteResponse(raw: unknown): BulkDeleteResponse {
  if (typeof raw === "object" && raw !== null) {
    const o = raw as Record<string, unknown>;

    if (o.ok === false) {
      const err =
        typeof o.error === "string" && o.error.length > 0
          ? o.error
          : "UNKNOWN_ERROR";

      return {
        ok: false,
        error: err,
      };
    }

    if (o.ok === true) {
      const dataObj = o.data;
      if (
        typeof dataObj === "object" &&
        dataObj !== null &&
        isNumber((dataObj as Record<string, unknown>).deleted)
      ) {
        const deletedNum = (dataObj as Record<string, unknown>)
          .deleted as number;

        return {
          ok: true,
          data: {
            deleted: deletedNum,
          },
        };
      }
    }
  }

  return {
    ok: false,
    error: "INVALID_RESPONSE",
  };
}

/**
 * /api/admin/process/[workerId]/stop-all 응답 가드
 */
export function parseStopAllResponse(raw: unknown): StopAllResponse {
  if (typeof raw === "object" && raw !== null) {
    const o = raw as Record<string, unknown>;

    if (o.ok === false) {
      const err =
        typeof o.error === "string" && o.error.length > 0
          ? o.error
          : "UNKNOWN_ERROR";

      return {
        ok: false,
        error: err,
      };
    }

    if (o.ok === true) {
      const dataObj = o.data;
      if (typeof dataObj === "object" && dataObj !== null) {
        const d = dataObj as Record<string, unknown>;
        const requestedOk = isNumber(d.requested);
        const eligibleOk = isNumber(d.eligible);
        const updatedOk = isNumber(d.updated);
        const stoppedOkIdsOk = isStringArray(d.stoppedOkIds);

        if (requestedOk && eligibleOk && updatedOk && stoppedOkIdsOk) {
          return {
            ok: true,
            data: {
              requested: d.requested as number,
              eligible: d.eligible as number,
              updated: d.updated as number,
              stoppedOkIds: d.stoppedOkIds as string[],
            },
          };
        }
      }
    }
  }

  return {
    ok: false,
    error: "INVALID_RESPONSE",
  };
}
