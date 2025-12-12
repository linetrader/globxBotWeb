// src/app/(site)/bot-config/hooks/useBotConfigForm.ts
"use client";

import { useState } from "react";
import {
  BotConfigPayload,
  BotMode,
  GroupInput,
  GroupKey,
  ExchangeItemInput,
  MarketKind,
  SingleBotInput,
  MultiBotInput,
  UseBotConfigFormReturn,
  SubmitState,
} from "../types";
import { validatePayloadDetailed } from "../gaurd/bot-config";

type UseBotConfigFormArgs = {
  // userId 제거
  defaultSymbol?: string;
  defaultName?: string;
};

export function useBotConfigForm(
  args: UseBotConfigFormArgs
): UseBotConfigFormReturn {
  const [mode, setMode] = useState<BotMode>(BotMode.SINGLE);

  // 공통
  const [name, setName] = useState<string>(args.defaultName ?? "");
  const [symbol, setSymbol] = useState<string>(args.defaultSymbol ?? "ETHUSDT");
  const [strategyConfigId, setStrategyConfigId] = useState<string>("");

  // SINGLE
  const [exchangeMarketId, setExchangeMarketId] = useState<string>("");
  const [singleMarketKind, setSingleMarketKind] = useState<MarketKind>(
    MarketKind.SPOT
  );

  // MULTI (API payload 그대로 유지)
  const [groupA, setGroupA] = useState<GroupInput>({
    key: GroupKey.A,
    exchanges: [],
  });
  const [groupB, setGroupB] = useState<GroupInput>({
    key: GroupKey.B,
    exchanges: [],
  });

  // MULTI (UI 전용: 거래소 이름 선택값)
  const [groupAExchangeNames, setGroupAExchangeNames] = useState<string[]>([]);
  const [groupBExchangeNames, setGroupBExchangeNames] = useState<string[]>([]);

  const [submit, setSubmit] = useState<SubmitState>({ submitting: false });

  function addExchangeToGroup(key: GroupKey) {
    const row: ExchangeItemInput = {
      exchangeMarketId: "",
      allocationBps: 0,
      enabled: true,
    };
    if (key === GroupKey.A) {
      setGroupA({ ...groupA, exchanges: [...groupA.exchanges, row] });
      setGroupAExchangeNames([...groupAExchangeNames, ""]);
    } else {
      setGroupB({ ...groupB, exchanges: [...groupB.exchanges, row] });
      setGroupBExchangeNames([...groupBExchangeNames, ""]);
    }
  }

  // 거래소명 선택 → 해당 행 마켓 초기화
  function setRowExchangeName(
    key: GroupKey,
    idx: number,
    exchangeName: string
  ) {
    if (key === GroupKey.A) {
      const names = groupAExchangeNames.slice();
      names[idx] = exchangeName;
      setGroupAExchangeNames(names);

      const ex = groupA.exchanges.slice();
      ex[idx] = { ...ex[idx], exchangeMarketId: "" };
      setGroupA({ ...groupA, exchanges: ex });
    } else {
      const names = groupBExchangeNames.slice();
      names[idx] = exchangeName;
      setGroupBExchangeNames(names);

      const ex = groupB.exchanges.slice();
      ex[idx] = { ...ex[idx], exchangeMarketId: "" };
      setGroupB({ ...groupB, exchanges: ex });
    }
  }

  function updateExchangeRow(
    key: GroupKey,
    idx: number,
    next: Partial<ExchangeItemInput>
  ) {
    const target = key === GroupKey.A ? groupA : groupB;
    const arr = target.exchanges.slice();
    const current = arr[idx];
    const merged: ExchangeItemInput = {
      exchangeMarketId:
        typeof next.exchangeMarketId === "string"
          ? next.exchangeMarketId
          : current.exchangeMarketId,
      allocationBps:
        typeof next.allocationBps === "number"
          ? next.allocationBps
          : current.allocationBps,
      enabled:
        typeof next.enabled === "boolean"
          ? next.enabled
          : typeof current.enabled === "boolean"
            ? current.enabled
            : true,
    };
    arr[idx] = merged;
    if (key === GroupKey.A) setGroupA({ ...groupA, exchanges: arr });
    else setGroupB({ ...groupB, exchanges: arr });
  }

  function removeExchangeRow(key: GroupKey, idx: number) {
    if (key === GroupKey.A) {
      const arr = groupA.exchanges.slice();
      arr.splice(idx, 1);
      setGroupA({ ...groupA, exchanges: arr });

      const names = groupAExchangeNames.slice();
      names.splice(idx, 1);
      setGroupAExchangeNames(names);
    } else {
      const arr = groupB.exchanges.slice();
      arr.splice(idx, 1);
      setGroupB({ ...groupB, exchanges: arr });

      const names = groupBExchangeNames.slice();
      names.splice(idx, 1);
      setGroupBExchangeNames(names);
    }
  }

  function composePayload(): BotConfigPayload {
    const base = {
      // userId 제거 (백엔드에서 세션으로 주입)
      name,
      mode,
      symbol,
      strategyConfigId,
      action: "create" as const,
    };

    if (mode === BotMode.SINGLE) {
      const p: SingleBotInput = {
        ...base,
        mode: BotMode.SINGLE,
        exchangeMarketId,
        singleMarketKind,
      };
      return p;
    }

    const gA: GroupInput | null =
      groupA.exchanges.length > 0
        ? { key: GroupKey.A, exchanges: groupA.exchanges }
        : null;
    const gB: GroupInput | null =
      groupB.exchanges.length > 0
        ? { key: GroupKey.B, exchanges: groupB.exchanges }
        : null;

    const groups: GroupInput[] = [];
    if (gA) groups.push(gA);
    if (gB) groups.push(gB);

    const p: MultiBotInput = {
      ...base,
      mode: BotMode.MULTI,
      exchangeMarketId: null,
      singleMarketKind: null,
      groups,
    };
    return p;
  }

  function validate(): { ok: true } | { ok: false; message: string } {
    const payload = composePayload();
    const issues = validatePayloadDetailed(payload);
    if (issues.length > 0) return { ok: false, message: issues[0].message };
    return { ok: true };
  }

  function setModeSingle() {
    setMode(BotMode.SINGLE);
  }
  function setModeMulti() {
    setMode(BotMode.MULTI);
  }

  // 반환 (userId 관련 필드 제거)
  return {
    mode,
    setModeSingle,
    setModeMulti,

    name,
    setName,
    symbol,
    setSymbol,
    strategyConfigId,
    setStrategyConfigId,

    exchangeMarketId,
    setExchangeMarketId,
    singleMarketKind,
    setSingleMarketKind,

    groupA,
    groupB,
    groupAExchangeNames,
    groupBExchangeNames,
    setRowExchangeName,

    addExchangeToGroup,
    updateExchangeRow,
    removeExchangeRow,

    composePayload,
    validate,
    submit,
    setSubmit,
  };
}
