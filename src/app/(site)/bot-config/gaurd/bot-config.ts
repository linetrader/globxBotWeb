// src/app/(site)/bot-config/gaurd/bot-config.ts
import {
  ApiResponse,
  BotConfigPayload,
  ExchangeMarketMeta,
  StrategyConfigMeta,
  GroupInput,
  ExchangeItemInput,
  BotMode,
  GroupKey,
  BotRow,
  BotStatus,
} from "../types";

/* ------------------------ 공통 유틸 ------------------------ */
export function isApiOk<T>(r: ApiResponse<T>): r is { ok: true; data: T } {
  return (r as { ok: boolean }).ok === true && "data" in r;
}

export function isValidAllocationBps(n: number): boolean {
  return Number.isInteger(n) && n >= 0 && n <= 10_000;
}

export function isGroupKey(v: string): v is GroupKey {
  return v === "A" || v === "B";
}

export function isBotMode(v: string): v is BotMode {
  return v === "SINGLE" || v === "MULTI";
}

/* ------------------------ 런타임 타입가드 ------------------------ */
export function isExchangeMarketMeta(a: unknown): a is ExchangeMarketMeta {
  const o = a as Record<string, unknown>;
  return (
    typeof o?.id === "string" &&
    typeof o?.exchangeName === "string" &&
    typeof o?.marketName === "string" &&
    typeof o?.symbol === "string"
  );
}

export function isStrategyConfigMeta(a: unknown): a is StrategyConfigMeta {
  const o = a as Record<string, unknown>;
  return typeof o?.id === "string" && typeof o?.name === "string";
}

/* ------------------------ BotStatus 가드 (loose) ------------------------ */
/**
 * 백엔드(DB) 상태는 아래 5가지를 포함할 수 있습니다.
 * STOPPED | STARTING | RUNNING | STOPPING | ERROR
 * + 방어적으로 UNKNOWN 도 수용
 */
export function isBotStatusLoose(v: unknown): v is BotStatus {
  return (
    v === "RUNNING" ||
    v === "STOPPED" ||
    v === "STARTING" ||
    v === "STOPPING" ||
    v === "ERROR" ||
    v === "UNKNOWN"
  );
}

/* ------------------------ 입력 검증(행/그룹) ------------------------ */
export function validateExchangeItemInput(i: ExchangeItemInput): boolean {
  if (typeof i.exchangeMarketId !== "string" || i.exchangeMarketId.length === 0)
    return false;
  if (!isValidAllocationBps(i.allocationBps)) return false;
  if (typeof i.enabled !== "undefined" && typeof i.enabled !== "boolean")
    return false;
  return true;
}

export function validateGroupInput(g: GroupInput): boolean {
  if (!isGroupKey(g.key)) return false;
  if (!Array.isArray(g.exchanges) || g.exchanges.length === 0) return false;
  for (const e of g.exchanges) {
    if (!validateExchangeItemInput(e)) return false;
  }
  return true;
}

export function validateMultiGroups(groups: GroupInput[]): boolean {
  const keys = groups.map((g) => g.key);
  const set = new Set(keys);
  if (set.size !== keys.length) return false;
  for (const g of groups) {
    if (!validateGroupInput(g)) return false;
  }
  return true;
}

/* ------------------------ 얕은 검증(수정) ------------------------ */
export function shallowValidatePayload(p: BotConfigPayload): boolean {
  if (!isBotMode(p.mode)) return false;

  // userId는 프론트에서 검증/전송하지 않음(서버 세션 주입)
  if (typeof p.name !== "string" || p.name.length === 0) return false;
  if (typeof p.symbol !== "string" || p.symbol.length === 0) return false;
  if (typeof p.strategyConfigId !== "string" || p.strategyConfigId.length === 0)
    return false;

  if (p.mode === "SINGLE") {
    return (
      typeof (p as { exchangeMarketId: string }).exchangeMarketId === "string"
    );
  }

  const m = p as { groups: GroupInput[] };
  return (
    Array.isArray(m.groups) &&
    m.groups.length > 0 &&
    validateMultiGroups(m.groups)
  );
}

/* ------------------------ 상세 검증(수정) ------------------------ */
export type ValidationIssue = { field: string; message: string };

/**
 * 필드별 상세 에러를 수집합니다.
 * - 반환 배열이 빈 배열이면 통과
 * - 첫 번째 메시지를 토스트 등으로 표시하면 원인 파악이 쉬워집니다.
 */
export function validatePayloadDetailed(
  p: BotConfigPayload
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // userId는 프론트에서 검증하지 않음 (서버에서 세션으로 강제)

  if (!p.name || p.name.length === 0) {
    issues.push({ field: "name", message: "봇 이름을 입력하세요." });
  }
  if (!p.symbol || p.symbol.length === 0) {
    issues.push({ field: "symbol", message: "심볼을 입력하세요." });
  }
  if (!p.strategyConfigId || p.strategyConfigId.length === 0) {
    issues.push({ field: "strategyConfigId", message: "전략을 선택하세요." });
  }

  // 모드별
  if (p.mode === "SINGLE") {
    if (!("exchangeMarketId" in p) || !p.exchangeMarketId) {
      issues.push({
        field: "exchangeMarketId",
        message: "SINGLE 모드에서는 거래소-마켓을 선택해야 합니다.",
      });
    }
    if (!("singleMarketKind" in p) || !p.singleMarketKind) {
      issues.push({
        field: "singleMarketKind",
        message: "SINGLE 모드에서는 마켓 종류를 선택해야 합니다.",
      });
    }
    return issues;
  }

  // MULTI
  const groups = (p as { groups: GroupInput[] }).groups;
  if (!Array.isArray(groups) || groups.length === 0) {
    issues.push({
      field: "groups",
      message: "MULTI 모드에서는 최소 1개 그룹(A/B)에 행을 추가해야 합니다.",
    });
    return issues;
  }

  // 그룹 키 중복/형식
  const keySet = new Set<string>();
  for (const g of groups) {
    if (!isGroupKey(g.key)) {
      issues.push({
        field: `groups.${String(g.key)}`,
        message: `그룹 키가 올바르지 않습니다: ${String(g.key)}`,
      });
    }
    if (keySet.has(g.key)) {
      issues.push({
        field: `groups.${g.key}`,
        message: `그룹 ${g.key}가 중복되었습니다.`,
      });
    }
    keySet.add(g.key);
  }

  // 각 그룹의 행/합계 검증
  for (const g of groups) {
    if (!Array.isArray(g.exchanges) || g.exchanges.length === 0) {
      issues.push({
        field: `groups.${g.key}.exchanges`,
        message: `그룹 ${g.key}에 최소 1개 거래소-마켓을 추가하세요.`,
      });
      continue;
    }

    let sum = 0;
    g.exchanges.forEach((e, idx) => {
      if (!e.exchangeMarketId) {
        issues.push({
          field: `groups.${g.key}.exchanges[${idx}].exchangeMarketId`,
          message: `그룹 ${g.key}의 ${idx + 1}번째 행: 마켓을 선택하세요.`,
        });
      }
      if (
        !Number.isInteger(e.allocationBps) ||
        e.allocationBps < 0 ||
        e.allocationBps > 10000
      ) {
        issues.push({
          field: `groups.${g.key}.exchanges[${idx}].allocationBps`,
          message: `그룹 ${g.key}의 ${idx + 1}번째 행: 배분은 0~10000 범위의 정수여야 합니다.`,
        });
      }
      sum += e.allocationBps;
    });

    if (sum > 10000) {
      issues.push({
        field: `groups.${g.key}.allocationBpsSum`,
        message: `그룹 ${g.key}의 배분 합은 10000(=100%)을 초과할 수 없습니다. (현재 ${sum})`,
      });
    }
  }

  return issues;
}

/* ------------------------ 봇 리스트 가드/도우미 ------------------------ */
/** 런타임에서 들어온 임의 객체가 BotRow 형태인지 검사 */
export function isBotRow(a: unknown): a is BotRow {
  const o = a as Record<string, unknown>;
  const mode = o?.mode;
  const status = o?.status;

  const modeOk = mode === "SINGLE" || mode === "MULTI";
  const statusOk =
    typeof status === "undefined" || isBotStatusLoose(status as unknown);

  return (
    typeof o?.id === "string" &&
    typeof o?.name === "string" &&
    typeof o?.symbol === "string" &&
    modeOk &&
    statusOk
  );
}

/**
 * 백엔드가 다양한 상태(STARTING/STOPPING/ERROR)를 반환해도
 * 그대로 보존. 없거나 알 수 없으면 enabled 플래그로 보수적 추론.
 */
export function coerceStatus(row: BotRow): BotStatus {
  if (isBotStatusLoose(row.status)) {
    return row.status;
  }
  if (typeof row.enabled === "boolean") {
    return row.enabled ? "RUNNING" : "STOPPED";
  }
  return "UNKNOWN";
}

/* ------------------------ 정규화 유틸 ------------------------ */
/** unknown → BotRow | null */
export function normalizeBotRow(u: unknown): BotRow | null {
  if (!isBotRow(u)) return null;
  const r = u as BotRow;
  return { ...r, status: coerceStatus(r) };
}

/** ApiResponse<T[]> | T[] 형태 모두 처리 */
export function parseBotsResponse(raw: unknown): BotRow[] {
  if (
    typeof (raw as { ok?: unknown })?.ok === "boolean" &&
    (raw as { ok: boolean }).ok === true &&
    Array.isArray((raw as { data?: unknown }).data)
  ) {
    const arr = (raw as { data: unknown[] }).data
      .map(normalizeBotRow)
      .filter(Boolean) as BotRow[];
    return arr;
  }
  if (Array.isArray(raw)) {
    return (raw as unknown[]).map(normalizeBotRow).filter(Boolean) as BotRow[];
  }
  return [];
}

/** ApiResponse<T> | T 형태 모두 처리 (단건) */
export function parseSingleBotResponse(raw: unknown): BotRow | null {
  if (
    typeof (raw as { ok?: unknown })?.ok === "boolean" &&
    (raw as { ok: boolean }).ok === true &&
    (raw as { data?: unknown }).data
  ) {
    return normalizeBotRow((raw as { data: unknown }).data);
  }
  return normalizeBotRow(raw);
}
