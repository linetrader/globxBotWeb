// src/app/(site)/my-config/components/HistoryTable.tsx
"use client";

import { Table } from "@/components/ui";
import type { UseMyConfigReturn } from "../hooks/useMyConfig";

type Props = { vm: UseMyConfigReturn };

// UID 요약 표시용 헬퍼
function formatUid(uid?: string): string {
  if (!uid) return "-";

  const maxLen = 20; // 표시할 최대 길이
  if (uid.length <= maxLen) return uid;

  const head = uid.slice(0, 10);
  const tail = uid.slice(-4);
  return `${head}...${tail}`;
}

export function HistoryTable({ vm }: Props) {
  const { history, selectedRowIndexes, onToggleRow, onToggleAll } = vm;

  const head: [string, string, string, string] = [
    "수정시각",
    "거래소",
    "UID",
    "생성시각",
  ];

  const rows: [string, string, string, string][] = history.map((h) => [
    new Date(h.updatedAt).toLocaleString(),
    `${h.exchangeName} (${h.exchangeCode})`,
    formatUid(h.uid),
    new Date(h.createdAt).toLocaleString(),
  ]);

  return (
    <>
      <h2 className="mb-3 text-base font-semibold">API 저장 내역</h2>
      <Table
        head={head}
        rows={rows}
        stickyHeader
        zebra
        dense
        colAlign={["left", "left", "left", "left"]}
        selectable
        selectedRowIndexes={selectedRowIndexes}
        onToggleRow={onToggleRow}
        onToggleAll={onToggleAll}
      />
    </>
  );
}
