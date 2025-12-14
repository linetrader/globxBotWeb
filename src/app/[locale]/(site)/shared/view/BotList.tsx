"use client";

import { useTranslations } from "next-intl"; // 번역 훅
import type { BotRow, BotStatus } from "@/app/[locale]/(site)/bot-config/types";
import {
  PlayIcon,
  StopIcon,
  TrashIcon,
  ArrowPathIcon,
  CpuChipIcon,
} from "@heroicons/react/24/outline";

type PendingAction = "start" | "stop" | null;

export type BotListProps = {
  title: string;
  bots: BotRow[];
  loading: boolean;
  error?: string;
  selectedBotId: string | null;
  deletingId: string | null;
  selectedStatus?: BotStatus;
  pendingId?: string | null;
  pendingAction?: PendingAction;

  onStartSelected: () => Promise<void> | void;
  onStopSelected: () => Promise<void> | void;
  onStartBot: (id: string) => Promise<void> | void;
  onStopBot: (id: string) => Promise<void> | void;
  onSelect: (id: string | null) => void;
  onReload: () => Promise<void>;
  onDeleteSelected: () => Promise<void> | void;
};

// 상태별 스타일 정의 (라이트/다크 공용 혹은 분기)
const statusStyles: Record<string, string> = {
  RUNNING:
    "bg-green-100 text-green-600 border-green-200 [:root[data-theme=dark]_&]:bg-green-500/10 [:root[data-theme=dark]_&]:text-green-400 [:root[data-theme=dark]_&]:border-green-500/20",
  STOPPED:
    "bg-gray-100 text-gray-500 border-gray-200 [:root[data-theme=dark]_&]:bg-gray-700/30 [:root[data-theme=dark]_&]:text-gray-400 [:root[data-theme=dark]_&]:border-gray-600",
  STARTING:
    "bg-blue-100 text-blue-600 border-blue-200 animate-pulse [:root[data-theme=dark]_&]:bg-blue-500/10 [:root[data-theme=dark]_&]:text-blue-400 [:root[data-theme=dark]_&]:border-blue-500/20",
  STOPPING:
    "bg-orange-100 text-orange-600 border-orange-200 animate-pulse [:root[data-theme=dark]_&]:bg-orange-500/10 [:root[data-theme=dark]_&]:text-orange-400 [:root[data-theme=dark]_&]:border-orange-500/20",
  ERROR:
    "bg-red-100 text-red-600 border-red-200 [:root[data-theme=dark]_&]:bg-red-500/10 [:root[data-theme=dark]_&]:text-red-400 [:root[data-theme=dark]_&]:border-red-500/20",
  UNKNOWN:
    "bg-gray-100 text-gray-400 border-gray-200 [:root[data-theme=dark]_&]:bg-gray-800 [:root[data-theme=dark]_&]:text-gray-500 [:root[data-theme=dark]_&]:border-gray-700",
};

function controlsFromStatus(status: BotStatus | undefined): {
  canStart: boolean;
  canStop: boolean;
} {
  if (status === "RUNNING") return { canStart: false, canStop: true };
  if (status === "STOPPED") return { canStart: true, canStop: false };
  return { canStart: false, canStop: false };
}

export default function BotList(props: BotListProps) {
  // 💡 방금 만든 언어팩 파일명("bot-list")과 일치시켜야 합니다.
  const t = useTranslations("bot-list");

  const {
    title,
    bots,
    loading,
    error,
    selectedBotId,
    deletingId,
    pendingId,
    onStartBot,
    onStopBot,
    onSelect,
    onReload,
    onDeleteSelected,
  } = props;

  if (loading && bots.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <span className="loading loading-spinner loading-lg text-[#06b6d4]"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error bg-red-50 border-red-200 text-red-600 [:root[data-theme=dark]_&]:bg-red-900/20 [:root[data-theme=dark]_&]:border-red-800 [:root[data-theme=dark]_&]:text-red-200">
        <span>{error}</span>
      </div>
    );
  }

  // 컨테이너 스타일 (라이트/다크)
  const containerClass =
    "rounded-2xl shadow-xl overflow-hidden border transition-colors " +
    "bg-white border-gray-200 " +
    "[:root[data-theme=dark]_&]:bg-[#131B2D] [:root[data-theme=dark]_&]:border-gray-800";

  const headerClass =
    "p-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors " +
    "bg-gray-50 border-gray-200 " +
    "[:root[data-theme=dark]_&]:bg-[#0B1222]/50 [:root[data-theme=dark]_&]:border-gray-800";

  return (
    <div className={containerClass}>
      {/* 리스트 헤더 */}
      <div className={headerClass}>
        <div className="flex items-center gap-2">
          {title && (
            <h3 className="font-bold text-gray-800 [:root[data-theme=dark]_&]:text-gray-200">
              {title}
            </h3>
          )}
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-600 [:root[data-theme=dark]_&]:bg-gray-800 [:root[data-theme=dark]_&]:text-gray-500 whitespace-nowrap">
            {t("list.total", { count: bots.length })} {/* 다국어 적용 */}
          </span>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* 선택된 봇 삭제 버튼 */}
          {selectedBotId && (
            <button
              onClick={() => void onDeleteSelected()}
              disabled={loading || deletingId === selectedBotId}
              className="btn btn-sm btn-error btn-outline gap-2"
            >
              {deletingId === selectedBotId ? (
                <span className="loading loading-spinner loading-xs" />
              ) : (
                <TrashIcon className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">{t("action.delete")}</span>
            </button>
          )}

          {/* 새로고침 버튼 */}
          <button
            onClick={() => void onReload()}
            disabled={loading}
            className="btn btn-sm btn-ghost btn-square text-gray-500 hover:bg-gray-200 [:root[data-theme=dark]_&]:text-gray-400 [:root[data-theme=dark]_&]:hover:bg-white/10"
            title={t("action.refresh")}
          >
            <ArrowPathIcon
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* 봇 리스트 본문 */}
      <div className="divide-y divide-gray-100 [:root[data-theme=dark]_&]:divide-gray-800">
        {bots.length === 0 ? (
          <div className="text-center py-12 text-gray-500 [:root[data-theme=dark]_&]:text-gray-600">
            {t("list.empty")}
          </div>
        ) : (
          bots.map((bot) => {
            const isSelected = selectedBotId === bot.id;
            const isPending = pendingId === bot.id;
            const isDeleting = deletingId === bot.id;
            const currentStatus = bot.status ?? "UNKNOWN";
            const controls = controlsFromStatus(bot.status);
            const isRunning = currentStatus === "RUNNING";

            return (
              <div
                key={bot.id}
                onClick={() => onSelect(isSelected ? null : bot.id)}
                className={`
                  group flex items-center justify-between p-4 transition-all cursor-pointer border-l-4
                  ${
                    isSelected
                      ? "bg-[#06b6d4]/5 border-l-[#06b6d4]"
                      : "bg-transparent border-l-transparent hover:bg-gray-50 [:root[data-theme=dark]_&]:hover:bg-[#0B1222] [:root[data-theme=dark]_&]:hover:border-l-gray-600"
                  }
                  ${isDeleting ? "opacity-50 pointer-events-none" : ""}
                `}
              >
                {/* [왼쪽] 봇 정보 */}
                <div className="flex items-center gap-4 overflow-hidden">
                  {/* 아이콘 */}
                  <div
                    className={`p-3 rounded-xl shrink-0 transition-colors ${
                      isRunning
                        ? "bg-[#06b6d4]/10 text-[#06b6d4]"
                        : "bg-gray-100 text-gray-400 group-hover:text-gray-600 [:root[data-theme=dark]_&]:bg-gray-800 [:root[data-theme=dark]_&]:text-gray-500 [:root[data-theme=dark]_&]:group-hover:text-gray-300"
                    }`}
                  >
                    <CpuChipIcon className="h-6 w-6" />
                  </div>

                  {/* 텍스트 정보 */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h4
                        className={`font-bold text-lg truncate ${
                          isSelected
                            ? "text-[#06b6d4]"
                            : "text-gray-900 [:root[data-theme=dark]_&]:text-gray-200"
                        }`}
                      >
                        {bot.name}
                      </h4>
                      {/* 상태 뱃지 - 다국어 적용 */}
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded border font-medium whitespace-nowrap ${statusStyles[currentStatus]}`}
                      >
                        {t(`status.${currentStatus.toLowerCase()}`)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-gray-500 [:root[data-theme=dark]_&]:text-gray-400">
                      <span className="px-2 py-0.5 rounded font-mono bg-gray-100 text-gray-600 [:root[data-theme=dark]_&]:bg-gray-800 [:root[data-theme=dark]_&]:text-gray-400">
                        {bot.mode}
                      </span>
                      <span className="truncate">{bot.symbol}</span>
                    </div>
                  </div>
                </div>

                {/* [오른쪽] 액션 버튼 (개별 제어) */}
                <div
                  className="flex items-center gap-2 pl-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  {isPending ? (
                    <span className="loading loading-spinner loading-md text-[#06b6d4]"></span>
                  ) : (
                    <>
                      {/* 정지 버튼 */}
                      {controls.canStop && (
                        <button
                          onClick={() => void onStopBot(bot.id)}
                          disabled={loading}
                          className="btn btn-sm btn-circle btn-outline border-red-200 text-red-500 hover:bg-red-500 hover:border-red-500 hover:text-white transition-all shadow-sm [:root[data-theme=dark]_&]:border-red-500/50 [:root[data-theme=dark]_&]:shadow-red-900/20"
                          title={t("action.stop")}
                        >
                          <StopIcon className="h-4 w-4" />
                        </button>
                      )}

                      {/* 시작 버튼 */}
                      {controls.canStart && (
                        <button
                          onClick={() => void onStartBot(bot.id)}
                          disabled={loading}
                          className="btn btn-sm btn-circle btn-outline border-[#06b6d4]/50 text-[#06b6d4] hover:bg-[#06b6d4] hover:border-[#06b6d4] hover:text-white transition-all shadow-sm [:root[data-theme=dark]_&]:shadow-cyan-900/20"
                          title={t("action.start")}
                        >
                          <PlayIcon className="h-4 w-4" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
