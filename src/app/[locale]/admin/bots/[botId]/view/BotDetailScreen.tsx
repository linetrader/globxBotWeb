// src/app/admin/bots/[botId]/view/BotDetailScreen.tsx
"use client";

import Link from "next/link";
import type { BotDetail } from "../types/detail";

function SectionWrapper(props: { title: string; children: React.ReactNode }) {
  return (
    <div className="border rounded p-4 space-y-2 bg-base-100 shadow">
      <h2 className="font-semibold text-lg">{props.title}</h2>
      <div className="text-sm">{props.children}</div>
    </div>
  );
}

function KeyVal(props: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex text-sm gap-2">
      <div className="w-40 text-gray-400">{props.k}</div>
      <div className="flex-1 break-all">{props.v ?? "-"}</div>
    </div>
  );
}

function ExecStateSection({ detail }: { detail: BotDetail }) {
  const st = detail.executionState;
  return (
    <SectionWrapper title="실행 상태">
      <KeyVal k="runtimeStatus" v={st.runtimeStatus} />
      <KeyVal k="running" v={String(st.running)} />
      <KeyVal k="lastHeartbeatAt" v={st.lastHeartbeatAt ?? "-"} />
      <KeyVal k="lastTickAt" v={st.lastTickAt ?? "-"} />
      <KeyVal k="workerId" v={st.workerId ?? "-"} />
      <KeyVal k="workerTaskArn" v={st.workerTaskArn ?? "-"} />
      <KeyVal k="workerLastHeartbeat" v={st.workerLastHeartbeat ?? "-"} />
      <KeyVal
        k="tickDriftSec"
        v={
          st.tickDriftSec === null || st.tickDriftSec === undefined
            ? "-"
            : st.tickDriftSec.toFixed(3)
        }
      />
    </SectionWrapper>
  );
}

function RecentTickSection({ detail }: { detail: BotDetail }) {
  const t = detail.recentTick;
  return (
    <SectionWrapper title="최근 틱 실행 현황">
      <KeyVal k="lastRunAt" v={t.lastRunAt ?? "-"} />
      <KeyVal k="lastResult" v={t.lastResult ?? "-"} />
      <KeyVal
        k="lastErrorMsg"
        v={
          t.lastErrorMsg && t.lastErrorMsg.trim() !== "" ? t.lastErrorMsg : "-"
        }
      />
    </SectionWrapper>
  );
}

function SettingsSection({ detail }: { detail: BotDetail }) {
  const s = detail.settings;
  return (
    <SectionWrapper title="봇 설정 / 전략 파라미터">
      <KeyVal k="mode" v={s.mode} />

      {s.mode === "SINGLE" ? (
        <>
          <KeyVal k="symbol" v={s.symbol ?? "-"} />
          <KeyVal k="exchange" v={s.exchanges.single ?? "-"} />
        </>
      ) : (
        <>
          <KeyVal
            k="group A"
            v={`${s.groupSymbols.A ?? "-"} @ ${s.exchanges.A ?? "-"}`}
          />
          <KeyVal
            k="group B"
            v={`${s.groupSymbols.B ?? "-"} @ ${s.exchanges.B ?? "-"}`}
          />
        </>
      )}

      <KeyVal k="leverage" v={s.leverage == null ? "-" : String(s.leverage)} />

      <KeyVal
        k="size(default/max)"
        v={`${s.size.defaultSize ?? "-"} / ${s.size.maxSize ?? "-"}`}
      />

      <KeyVal
        k="martin"
        v={
          s.martin.useMartin ? `ON x${s.martin.martinMultiplier ?? "?"}` : "OFF"
        }
      />

      <div className="divider text-xs opacity-60">Indicators</div>

      <KeyVal k="rsiLength" v={s.strategyParams.rsiLength ?? "-"} />
      <KeyVal
        k="rsi lower/upper"
        v={`${s.strategyParams.lowerTh ?? "-"} / ${
          s.strategyParams.upperTh ?? "-"
        }`}
      />

      <KeyVal
        k="BBW (thresh / period / k)"
        v={`${s.strategyParams.bbwThresh ?? "-"} / ${
          s.strategyParams.bbPeriod ?? "-"
        } / ${s.strategyParams.bbK ?? "-"}`}
      />

      <KeyVal
        k="trend fast/slow"
        v={`${s.strategyParams.trendFast ?? "-"} / ${
          s.strategyParams.trendSlow ?? "-"
        }`}
      />

      <KeyVal
        k="trend RSI pullback U/L"
        v={`${
          s.strategyParams.trendRsiUpperPullback ?? "-"
        } / ${s.strategyParams.trendRsiLowerPullback ?? "-"}`}
      />

      <KeyVal
        k="targetProfit %"
        v={
          s.strategyParams.targetProfit == null
            ? "-"
            : `${s.strategyParams.targetProfit}%`
        }
      />
    </SectionWrapper>
  );
}

export function BotDetailScreen(props: {
  detail: BotDetail | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}) {
  const { detail, loading, error, onRefresh } = props;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* 헤더 / 상단 바 */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="space-y-1">
          <div className="text-sm">
            <Link href="/admin/bots/list" className="link">
              ← 목록으로
            </Link>
          </div>

          <h1 className="text-2xl font-bold">
            {detail ? detail.name : "트레이딩 봇"}
          </h1>

          {detail && (
            <div className="text-xs text-gray-400">
              {detail.username} · {detail.botId}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button className="btn btn-sm" onClick={onRefresh} disabled={loading}>
            새로고침
          </button>
        </div>
      </div>

      {/* 로딩 상태 */}
      {loading && (
        <div className="flex items-center gap-2 text-sm">
          <span className="loading loading-spinner loading-sm" />
          <span>불러오는 중…</span>
        </div>
      )}

      {/* 에러 */}
      {error && (
        <div className="alert alert-error text-sm">
          <span>에러: {error}</span>
        </div>
      )}

      {/* 데이터 없음 */}
      {!loading && !error && !detail && (
        <div className="text-sm text-gray-500">
          데이터를 불러올 수 없습니다.
        </div>
      )}

      {/* 실제 섹션들 */}
      {detail && (
        <>
          <ExecStateSection detail={detail} />
          <RecentTickSection detail={detail} />
          <SettingsSection detail={detail} />

          {/* TODO: Positions/PnL section */}
          {/* TODO: API Key 상태 section */}
          {/* TODO: 관리 액션(START/STOP 버튼) section */}
        </>
      )}
    </div>
  );
}
