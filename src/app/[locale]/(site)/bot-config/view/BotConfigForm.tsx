"use client";

import { useToast } from "@/components/ui";
import { postJson } from "../lib/fetcher";
import { useBotConfigForm } from "../hooks/useBotConfigForm";
import { useBots } from "../hooks/useBots";
import {
  ApiResponse,
  BotConfigPayload,
  BotMode,
  GroupKey,
  MarketKind,
  BotStatus,
  BotRow,
} from "../types";
import BotList from "@/app/[locale]/(site)/shared/view/BotList";
import { useBotStatusWatcher } from "@/app/[locale]/(site)/shared/hooks/useBotStatusWatcher";
import { useTranslations } from "next-intl";
import {
  CpuChipIcon,
  Square3Stack3DIcon,
  TrashIcon,
  PlusIcon,
  ServerStackIcon,
} from "@heroicons/react/24/outline";

export default function BotConfigForm() {
  const t = useTranslations("bot-config");
  const { toast } = useToast();

  // 폼 훅
  const form = useBotConfigForm({});

  // 봇/메타 훅
  const {
    strategies,
    loadingStrategies,
    markets,
    exchangeNames,
    loadingMarkets,
    marketsError,
    marketsByExchangeName,

    bots,
    loadingBots,
    botsError,
    hasBots,
    loadBots,
    startBot,
    stopBot,

    selectedBotId,
    setSelectedBotId,
    deleteBot,
    deletingId,

    getBotById,
  } = useBots();

  const watcher = useBotStatusWatcher({
    startBot,
    stopBot,
    loadBots,
    getBotsSnapshot: () => bots,
    getBotById,
  });

  const selectedBot: BotRow | undefined = bots.find(
    (b) => b.id === (selectedBotId ?? "")
  );
  const selectedStatus: BotStatus | undefined = selectedBot?.status;

  async function onSubmit() {
    const v = form.validate();
    if (!v.ok) {
      toast({
        title: t("toast.validationError"),
        description: v.message,
        variant: "error",
      });
      return;
    }
    const payload = form.composePayload();
    form.setSubmit({ submitting: true });
    try {
      const res = await postJson<BotConfigPayload, ApiResponse<unknown>>(
        "/api/bot-config",
        payload
      );
      if (res.ok) {
        toast({
          title: t("toast.saveSuccess"),
          description: t("toast.saveSuccessDesc"),
        });
        form.setSubmit({ submitting: false, success: true });
        await loadBots();
      } else {
        toast({
          title: t("toast.saveFail"),
          description: `${res.error}${
            typeof (res as { code?: unknown }).code === "string"
              ? ` (${(res as { code?: string }).code})`
              : ""
          }`,
          variant: "error",
        });
        form.setSubmit({
          submitting: false,
          error: (res as { error?: string }).error ?? "error",
        });
      }
    } catch {
      toast({
        title: t("toast.networkError"),
        description: t("toast.networkErrorDesc"),
        variant: "error",
      });
      form.setSubmit({ submitting: false, error: "network" });
    }
  }

  const onDeleteSelected = async (): Promise<void> => {
    if (!selectedBotId) return;
    const ok = window.confirm(t("confirm.delete"));
    if (!ok) return;
    const res = await deleteBot(selectedBotId);
    if (res.ok) {
      if (selectedBotId) setSelectedBotId(null);
      toast({
        title: t("toast.deleteSuccess"),
        description: t("toast.deleteSuccessDesc"),
      });
      await loadBots();
    } else {
      toast({
        title: t("toast.deleteFail"),
        description: res.error ?? t("toast.deleteFailDesc"),
        variant: "error",
      });
    }
  };

  // [수정] 공통 스타일: 라이트/다크 분기
  const inputClass =
    "input input-bordered w-full transition-colors " +
    "bg-white border-gray-300 text-gray-900 focus:border-[#06b6d4] focus:outline-none " +
    "[:root[data-theme=dark]_&]:bg-[#0B1222] [:root[data-theme=dark]_&]:border-gray-700 [:root[data-theme=dark]_&]:text-gray-100";

  const selectClass =
    "select select-bordered w-full transition-colors " +
    "bg-white border-gray-300 text-gray-900 focus:border-[#06b6d4] focus:outline-none " +
    "[:root[data-theme=dark]_&]:bg-[#0B1222] [:root[data-theme=dark]_&]:border-gray-700 [:root[data-theme=dark]_&]:text-gray-100";

  const labelClass =
    "label-text font-medium text-gray-600 [:root[data-theme=dark]_&]:text-gray-400";

  const cardBaseClass =
    "rounded-2xl shadow-xl overflow-hidden border transition-colors " +
    "bg-white border-gray-200 " +
    "[:root[data-theme=dark]_&]:bg-[#131B2D] [:root[data-theme=dark]_&]:border-gray-800";

  const headerBaseClass =
    "p-6 border-b flex items-center gap-3 " +
    "bg-gray-50 border-gray-200 " +
    "[:root[data-theme=dark]_&]:bg-[#0B1222]/50 [:root[data-theme=dark]_&]:border-gray-800";

  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-8">
      {/* 1. 설정 폼 영역 */}
      <div className={cardBaseClass}>
        {/* 헤더 */}
        <div className={headerBaseClass}>
          <div className="p-2 bg-[#06b6d4]/10 rounded-lg">
            <CpuChipIcon className="h-6 w-6 text-[#06b6d4]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 [:root[data-theme=dark]_&]:text-white">
              {t("form.title")}
            </h2>
            <p className="text-sm text-gray-500 [:root[data-theme=dark]_&]:text-gray-400">
              {t("form.subtitle")}
            </p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {marketsError ? (
            <div className="alert alert-error mb-4">
              <span>{t("error.metaLoadFail")}</span>
            </div>
          ) : null}

          {/* 기본 설정 (이름, 심볼, 전략) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="form-control">
              <label className="label">
                <span className={labelClass}>{t("field.botName")}</span>
              </label>
              <input
                className={inputClass}
                value={form.name}
                onChange={(e) => form.setName(e.target.value)}
                placeholder={t("placeholder.botName")}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className={labelClass}>{t("field.symbol")}</span>
              </label>
              <select
                className={selectClass}
                value={form.symbol}
                onChange={(e) => form.setSymbol(e.target.value)}
              >
                <option value="">{t("placeholder.selectSymbol")}</option>
                <option value="BTCUSDT">BTCUSDT</option>
                <option value="ETHUSDT">ETHUSDT</option>
                <option value="XRPUSDT">XRPUSDT</option>
                <option value="SOLUSDT">SOLUSDT</option>
                <option value="DOGEUSDT">DOGEUSDT</option>
                <option value="TRXUSDT">TRXUSDT</option>
                <option value="BNBUSDT">BNBUSDT</option>
              </select>
            </div>

            <div className="form-control">
              <label className="label">
                <span className={labelClass}>{t("field.strategy")}</span>
              </label>
              <select
                className={selectClass}
                value={form.strategyConfigId}
                onChange={(e) => form.setStrategyConfigId(e.target.value)}
                disabled={loadingStrategies}
              >
                <option value="">{t("placeholder.selectStrategy")}</option>
                {strategies.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="divider border-gray-200 [:root[data-theme=dark]_&]:border-gray-800" />

          {/* 모드 선택 탭 */}
          <div className="flex flex-col gap-4">
            <div className="flex p-1 rounded-lg w-fit border transition-colors bg-gray-100 border-gray-200 [:root[data-theme=dark]_&]:bg-[#0B1222] [:root[data-theme=dark]_&]:border-gray-800">
              <button
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  form.mode === BotMode.SINGLE
                    ? "bg-[#06b6d4] text-white shadow-lg"
                    : "text-gray-500 hover:text-gray-900 [:root[data-theme=dark]_&]:text-gray-400 [:root[data-theme=dark]_&]:hover:text-white"
                }`}
                onClick={form.setModeSingle}
              >
                {t("mode.single")}
              </button>
              <button
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  form.mode === BotMode.MULTI
                    ? "bg-[#06b6d4] text-white shadow-lg"
                    : "text-gray-500 hover:text-gray-900 [:root[data-theme=dark]_&]:text-gray-400 [:root[data-theme=dark]_&]:hover:text-white"
                }`}
                onClick={form.setModeMulti}
              >
                {t("mode.multi")}
              </button>
            </div>

            {/* SINGLE 모드 내용 */}
            {form.mode === BotMode.SINGLE && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="form-control">
                  <label className="label">
                    <span className={labelClass}>
                      {t("field.exchangeMarket")}
                    </span>
                  </label>
                  <select
                    className={selectClass}
                    value={form.exchangeMarketId}
                    onChange={(e) => form.setExchangeMarketId(e.target.value)}
                    disabled={loadingMarkets}
                  >
                    <option value="">{t("placeholder.select")}</option>
                    {markets.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.exchangeName} / {m.marketName} / {m.symbol}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className={labelClass}>{t("field.marketKind")}</span>
                  </label>
                  <select
                    className={selectClass}
                    value={form.singleMarketKind}
                    onChange={(e) =>
                      form.setSingleMarketKind(e.target.value as MarketKind)
                    }
                  >
                    <option value={MarketKind.SPOT}>SPOT</option>
                    <option value={MarketKind.FUTURES}>FUTURES</option>
                  </select>
                </div>
              </div>
            )}

            {/* MULTI 모드 내용 */}
            {form.mode === BotMode.MULTI && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
                {[
                  {
                    key: GroupKey.A,
                    title: t("group.a"),
                    list: form.groupA.exchanges,
                    names: form.groupAExchangeNames,
                  },
                  {
                    key: GroupKey.B,
                    title: t("group.b"),
                    list: form.groupB.exchanges,
                    names: form.groupBExchangeNames,
                  },
                ].map((group) => (
                  <div
                    key={group.key}
                    className="border rounded-xl p-5 transition-colors bg-gray-50 border-gray-200 [:root[data-theme=dark]_&]:bg-[#0B1222] [:root[data-theme=dark]_&]:border-gray-800"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold flex items-center gap-2 text-gray-800 [:root[data-theme=dark]_&]:text-gray-200">
                        <Square3Stack3DIcon className="h-5 w-5 text-[#06b6d4]" />
                        {group.title}
                      </h3>
                      <button
                        className="btn btn-xs btn-outline border-gray-300 text-gray-500 hover:border-[#06b6d4] hover:text-[#06b6d4] [:root[data-theme=dark]_&]:border-gray-600 [:root[data-theme=dark]_&]:text-gray-400"
                        onClick={() => form.addExchangeToGroup(group.key)}
                      >
                        <PlusIcon className="h-3 w-3 mr-1" />
                        {t("action.addExchange")}
                      </button>
                    </div>

                    <div className="space-y-4">
                      {group.list.length === 0 && (
                        <div className="text-center py-8 text-sm border border-dashed rounded-lg text-gray-500 border-gray-300 [:root[data-theme=dark]_&]:text-gray-600 [:root[data-theme=dark]_&]:border-gray-800">
                          {t("message.noExchanges")}
                        </div>
                      )}

                      {group.list.map((row, idx) => {
                        const selectedExName = group.names[idx] ?? "";
                        const options = marketsByExchangeName(selectedExName);
                        return (
                          <div
                            key={`${group.key}-${idx}`}
                            className="p-4 rounded-lg border relative group bg-white border-gray-200 [:root[data-theme=dark]_&]:bg-[#131B2D] [:root[data-theme=dark]_&]:border-gray-700"
                          >
                            <div className="grid grid-cols-2 gap-3 mb-3">
                              <div className="form-control">
                                <label className="label py-1">
                                  <span className="label-text text-xs text-gray-500">
                                    {t("field.exchange")}
                                  </span>
                                </label>
                                <select
                                  className={`select select-sm select-bordered w-full bg-white border-gray-300 text-gray-900 [:root[data-theme=dark]_&]:bg-[#0B1222] [:root[data-theme=dark]_&]:border-gray-700 [:root[data-theme=dark]_&]:text-gray-200`}
                                  value={selectedExName}
                                  onChange={(e) =>
                                    form.setRowExchangeName(
                                      group.key,
                                      idx,
                                      e.target.value
                                    )
                                  }
                                  disabled={loadingMarkets}
                                >
                                  <option value="">-</option>
                                  {exchangeNames.map((name) => (
                                    <option key={name} value={name}>
                                      {name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="form-control">
                                <label className="label py-1">
                                  <span className="label-text text-xs text-gray-500">
                                    {t("field.market")}
                                  </span>
                                </label>
                                <select
                                  className={`select select-sm select-bordered w-full bg-white border-gray-300 text-gray-900 [:root[data-theme=dark]_&]:bg-[#0B1222] [:root[data-theme=dark]_&]:border-gray-700 [:root[data-theme=dark]_&]:text-gray-200`}
                                  value={row.exchangeMarketId}
                                  onChange={(e) =>
                                    form.updateExchangeRow(group.key, idx, {
                                      exchangeMarketId: e.target.value,
                                    })
                                  }
                                  disabled={
                                    loadingMarkets ||
                                    selectedExName.length === 0
                                  }
                                >
                                  <option value="">-</option>
                                  {options.map((m) => (
                                    <option key={m.id} value={m.id}>
                                      {m.symbol}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="form-control flex-1">
                                <label className="label py-1">
                                  <span className="label-text text-xs text-gray-500">
                                    {t("field.allocation")}
                                  </span>
                                </label>
                                <div className="join w-full">
                                  <input
                                    type="number"
                                    className="input input-sm input-bordered join-item w-full bg-white border-gray-300 text-gray-900 [:root[data-theme=dark]_&]:bg-[#0B1222] [:root[data-theme=dark]_&]:border-gray-700 [:root[data-theme=dark]_&]:text-gray-200"
                                    value={row.allocationBps}
                                    min={0}
                                    max={10000}
                                    onChange={(e) =>
                                      form.updateExchangeRow(group.key, idx, {
                                        allocationBps: Number(e.target.value),
                                      })
                                    }
                                  />
                                  <span className="btn btn-sm join-item text-xs font-normal pointer-events-none bg-gray-100 border-gray-300 text-gray-500 [:root[data-theme=dark]_&]:bg-gray-800 [:root[data-theme=dark]_&]:border-gray-700 [:root[data-theme=dark]_&]:text-gray-400">
                                    bps
                                  </span>
                                </div>
                              </div>

                              <div className="form-control">
                                <label className="label py-1">
                                  <span className="label-text text-xs text-gray-500">
                                    {t("field.enabled")}
                                  </span>
                                </label>
                                <input
                                  type="checkbox"
                                  className="toggle toggle-sm toggle-success"
                                  checked={
                                    typeof row.enabled === "boolean"
                                      ? row.enabled
                                      : true
                                  }
                                  onChange={(e) =>
                                    form.updateExchangeRow(group.key, idx, {
                                      enabled: e.target.checked,
                                    })
                                  }
                                />
                              </div>

                              <div className="form-control pt-7">
                                <button
                                  className="btn btn-sm btn-ghost text-error hover:bg-error/10"
                                  onClick={() =>
                                    form.removeExchangeRow(group.key, idx)
                                  }
                                  aria-label="Remove"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 하단 액션 버튼 */}
        <div className="p-6 border-t flex justify-end bg-gray-50 border-gray-200 [:root[data-theme=dark]_&]:bg-[#0B1222]/50 [:root[data-theme=dark]_&]:border-gray-800">
          <button
            className="btn btn-primary bg-[#06b6d4] hover:bg-[#0891b2] border-none text-white font-bold px-8 shadow-lg shadow-cyan-500/20 [:root[data-theme=dark]_&]:shadow-cyan-900/20"
            onClick={onSubmit}
            disabled={
              form.submit.submitting || loadingMarkets || loadingStrategies
            }
          >
            {form.submit.submitting ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                {t("action.saving")}
              </>
            ) : (
              t("action.save")
            )}
          </button>
        </div>
      </div>

      {/* 2. 봇 리스트 영역 */}
      <div>
        <div className="flex items-center gap-2 mb-4 px-1">
          <ServerStackIcon className="h-6 w-6 text-[#06b6d4]" />
          <h3 className="text-xl font-bold text-gray-900 [:root[data-theme=dark]_&]:text-white">
            {t("list.title")}
          </h3>
        </div>

        <BotList
          title="" // 상단에 커스텀 타이틀 사용
          bots={bots}
          loading={loadingBots}
          error={botsError}
          selectedBotId={selectedBotId ?? null}
          deletingId={deletingId}
          selectedStatus={selectedStatus}
          pendingId={watcher.pendingId}
          pendingAction={watcher.pendingAction}
          onStartSelected={async () => {
            if (!selectedBot) return;
            const r = await watcher.startAndWait(selectedBot.id);
            if (!r.ok)
              toast({
                title: t("toast.startFail"),
                description: r.reason,
                variant: "error",
              });
          }}
          onStopSelected={async () => {
            if (!selectedBot) return;
            const r = await watcher.stopAndWait(selectedBot.id);
            if (!r.ok)
              toast({
                title: t("toast.stopFail"),
                description: r.reason,
                variant: "error",
              });
          }}
          onStartBot={async (id: string) => {
            const r = await watcher.startAndWait(id);
            if (!r.ok)
              toast({
                title: t("toast.startFail"),
                description: r.reason,
                variant: "error",
              });
          }}
          onStopBot={async (id: string) => {
            const r = await watcher.stopAndWait(id);
            if (!r.ok)
              toast({
                title: t("toast.stopFail"),
                description: r.reason,
                variant: "error",
              });
          }}
          onSelect={(id: string | null) => setSelectedBotId(id)}
          onReload={async () => {
            await loadBots();
          }}
          onDeleteSelected={onDeleteSelected}
        />

        {!loadingBots && !hasBots && (
          <div className="text-center py-12 text-gray-500 border border-dashed rounded-xl mt-4 border-gray-300 [:root[data-theme=dark]_&]:border-gray-800 [:root[data-theme=dark]_&]:text-gray-500">
            {t("list.empty")}
          </div>
        )}
      </div>
    </div>
  );
}
