// src/app/admin/bots/[botId]/page.tsx
"use client";

import { useParams } from "next/navigation";
import { useBotDetail } from "./hooks/useBotDetail";
import { BotDetailScreen } from "./view/BotDetailScreen";

export default function BotDetailPage() {
  const params = useParams();
  // next/navigation의 useParams()는 string | string[]일 수 있음
  const rawId = params?.botId;
  const botId = Array.isArray(rawId) ? rawId[0] : (rawId ?? null);

  const { detail, loading, error, refetch } = useBotDetail(botId);

  return (
    <BotDetailScreen
      detail={detail}
      loading={loading}
      error={error}
      onRefresh={refetch}
    />
  );
}
