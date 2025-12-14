// src/app/[locale]/(site)/(home)/view/HomePage.tsx
"use client";

import { useHomeBots } from "../hooks/useHomeBots";
import { useToast } from "@/components/ui";
// [수정] BotList 임포트 경로에 [locale] 추가
import BotList from "@/app/[locale]/(site)/shared/view/BotList";
// [수정] useBotStatusWatcher 임포트 경로에 [locale] 추가
import { useBotStatusWatcher } from "@/app/[locale]/(site)/shared/hooks/useBotStatusWatcher";
import { useTranslations } from "next-intl"; // [추가] 번역 훅 사용

export default function HomePage() {
  // [수정] 'Global' 네임스페이스는 존재하지 않으므로 'header'를 사용합니다.
  // 키가 header.json에 없어도 ?? 연산자로 인해 기본 텍스트가 표시됩니다.
  const t = useTranslations("header");

  const {
    isAuthed,
    authChecked,
    bots,
    loadingBots,
    botsError,
    selected,
    setSelectedBotId,
    startBot,
    stopBot,
    reload,
    getBotById,
  } = useHomeBots();

  const { toast } = useToast();

  const watcher = useBotStatusWatcher({
    startBot,
    stopBot,
    loadBots: reload,
    getBotsSnapshot: () => bots,
    getBotById,
  });

  if (authChecked && !isAuthed) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="alert">
          {/* [번역 적용] 키가 없으면 기본 텍스트 표시 */}
          <span>{t("auth.pleaseLogin") ?? "로그인을 해주세요."}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <BotList
        // [번역 적용]
        title={t("app.botList") ?? "봇 리스트"}
        bots={bots}
        loading={loadingBots}
        error={botsError}
        selectedBotId={selected.selectedBotId}
        deletingId={null}
        selectedStatus={selected.selectedStatus}
        pendingId={watcher.pendingId}
        pendingAction={watcher.pendingAction}
        onStartSelected={async () => {
          const id = selected.selectedBot?.id;
          if (!id) return;
          const r = await watcher.startAndWait(id);
          if (!r.ok) {
            toast({
              // [번역 적용]
              title: t("status.startFailed") ?? "시작 실패",
              description: r.reason,
              variant: "error",
            });
          }
        }}
        onStopSelected={async () => {
          const id = selected.selectedBot?.id;
          if (!id) return;
          const r = await watcher.stopAndWait(id);
          if (!r.ok) {
            toast({
              // [번역 적용]
              title: t("status.stopFailed") ?? "정지 실패",
              description: r.reason,
              variant: "error",
            });
          }
        }}
        onStartBot={async (id: string) => {
          const r = await watcher.startAndWait(id);
          if (!r.ok) {
            toast({
              // [번역 적용]
              title: t("status.startFailed") ?? "시작 실패",
              description: r.reason,
              variant: "error",
            });
          }
        }}
        onStopBot={async (id: string) => {
          const r = await watcher.stopAndWait(id);
          if (!r.ok) {
            toast({
              // [번역 적용]
              title: t("status.stopFailed") ?? "정지 실패",
              description: r.reason,
              variant: "error",
            });
          }
        }}
        onSelect={(id) => setSelectedBotId(id)}
        onReload={async () => {
          await reload();
        }}
        onDeleteSelected={async () => {
          /* 홈에서는 삭제 미사용 */
        }}
      />
    </div>
  );
}
