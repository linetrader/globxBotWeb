// src/app/(site)/(home)/view/HomePage.tsx
"use client";

import { useHomeBots } from "../hooks/useHomeBots";
import { useToast } from "@/components/ui";
import BotList from "@/app/(site)/shared/view/BotList";
import { useBotStatusWatcher } from "@/app/(site)/shared/hooks/useBotStatusWatcher";

export default function HomePage() {
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
    getBotById, // ★ useHomeBots가 패스스루
  } = useHomeBots();

  const { toast } = useToast();

  const watcher = useBotStatusWatcher({
    startBot,
    stopBot,
    loadBots: reload,
    getBotsSnapshot: () => bots,
    getBotById, // ★ 단건 조회 사용
  });

  if (authChecked && !isAuthed) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="alert">
          <span>로그인을 해주세요.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <BotList
        title="봇 리스트"
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
              title: "시작 실패",
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
              title: "정지 실패",
              description: r.reason,
              variant: "error",
            });
          }
        }}
        onStartBot={async (id: string) => {
          const r = await watcher.startAndWait(id);
          if (!r.ok) {
            toast({
              title: "시작 실패",
              description: r.reason,
              variant: "error",
            });
          }
        }}
        onStopBot={async (id: string) => {
          const r = await watcher.stopAndWait(id);
          if (!r.ok) {
            toast({
              title: "정지 실패",
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
