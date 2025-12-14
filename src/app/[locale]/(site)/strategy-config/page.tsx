// src/app/(site)/strategy-config/page.tsx
"use client";

import { useCallback, useMemo, useState } from "react";
import { Section } from "@/components/ui";
// import type {
//   StrategyItem,
//   StrategyCreateBody,
//   StrategyUpdateBody,
// } from "@/types/strategy-config";
import { useStrategyConfigs } from "./hooks/useStrategyConfigs";
import { useCreateStrategyForm } from "./hooks/useCreateStrategyForm";
import { useStrategyConfigsTable } from "./hooks/useStrategyConfigsTable";
import CreateStrategyFormView from "./view/CreateStrategyFormView";
import StrategyConfigsTableView from "./view/StrategyConfigsTableView";
import EditStrategyPanel from "./view/EditStrategyPanel";
import { StrategyCreateBody, StrategyItem, StrategyUpdateBody } from "./types";

export default function StrategyConfigsPage() {
  const {
    items,
    loading,
    error,
    list,
    createOne,
    updateOne,
    deleteOne,
    setError,
  } = useStrategyConfigs();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editTarget, setEditTarget] = useState<StrategyItem | null>(null);

  const onCreate = useCallback(
    async (body: StrategyCreateBody): Promise<void> => {
      const created = await createOne(body);
      if (created) {
        await list();
        setSelectedIds(new Set());
      }
    },
    [createOne, list]
  );

  const onUpdate = useCallback(
    async (body: StrategyUpdateBody): Promise<void> => {
      const updated = await updateOne(body);
      if (updated) {
        await list();
        setEditTarget(null);
      }
    },
    [updateOne, list]
  );

  const onToggleRow = useCallback(
    (idx: number, checked: boolean): void => {
      const id = items[idx]?.id;
      if (!id) return;
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (checked) next.add(id);
        else next.delete(id);
        return next;
      });
    },
    [items]
  );

  const onToggleAll = useCallback(
    (checked: boolean): void => {
      if (checked) setSelectedIds(new Set(items.map((i) => i.id)));
      else setSelectedIds(new Set());
    },
    [items]
  );

  const onRowClick = useCallback(
    (idx: number): void => {
      const it = items[idx];
      if (it) setEditTarget(it);
    },
    [items]
  );

  const onDeleteSelected = useCallback(async (): Promise<void> => {
    if (selectedIds.size === 0) return;
    for (const id of selectedIds) {
      const ok = await deleteOne({ id });
      if (!ok) break;
    }
    await list();
    setSelectedIds(new Set());
  }, [selectedIds, deleteOne, list]);

  const selectedCount = useMemo(() => selectedIds.size, [selectedIds]);

  // view hooks
  const createHook = useCreateStrategyForm({ onCreate, error, setError });
  const tableHook = useStrategyConfigsTable({
    items,
    selectedIds,
    onToggleRow,
    onToggleAll,
    onDeleteSelected,
    onRowClick,
    loading,
    error,
  });

  return (
    <Section className="mx-auto max-w-5xl p-4">
      <CreateStrategyFormView
        form={createHook.form}
        setForm={createHook.setForm}
        creating={createHook.creating}
        error={createHook.error}
        onCreateClick={createHook.onCreateClick}
      />

      <StrategyConfigsTableView
        rows={tableHook.rows}
        allSelected={tableHook.allSelected}
        selectedCount={tableHook.selectedCount}
        loading={tableHook.loading}
        onToggleAll={tableHook.onToggleAll}
        onRowClick={tableHook.onRowClick}
        onToggleRow={tableHook.onToggleRow}
        onDeleteSelected={tableHook.onDeleteSelected}
      />

      {/* ✅ 훅을 별도 컴포넌트로 분리하여 조건부 렌더링 */}
      <EditStrategyPanel
        editTarget={editTarget}
        onUpdate={onUpdate}
        onClose={() => setEditTarget(null)}
      />

      {selectedCount > 0 && (
        <p className="mt-2 text-xs text-base-content/60">
          선택: {selectedCount}개
        </p>
      )}
    </Section>
  );
}
