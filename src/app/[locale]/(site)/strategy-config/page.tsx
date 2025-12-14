"use client";

import { useCallback, useState } from "react"; // [수정] useMemo 제거
import { useTranslations } from "next-intl";
import { useStrategyConfigs } from "./hooks/useStrategyConfigs";
import { useCreateStrategyForm } from "./hooks/useCreateStrategyForm";
import { useStrategyConfigsTable } from "./hooks/useStrategyConfigsTable";
import CreateStrategyFormView from "./view/CreateStrategyFormView";
import StrategyConfigsTableView from "./view/StrategyConfigsTableView";
import EditStrategyPanel from "./view/EditStrategyPanel";
import { StrategyCreateBody, StrategyItem, StrategyUpdateBody } from "./types";
import { AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";

export default function StrategyConfigsPage() {
  const t = useTranslations("strategy-config");

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

  // [수정] 불필요한 selectedCount useMemo 제거 (tableHook에서 처리됨)

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
    // [수정] 라이트: bg-gray-50/text-gray-900 ↔ 다크: bg-[#0B1222]/text-gray-100
    <div className="min-h-screen p-6 md:p-8 transition-colors duration-300 bg-gray-50 text-gray-900 [:root[data-theme=dark]_&]:bg-[#0B1222] [:root[data-theme=dark]_&]:text-gray-100">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* 헤더 */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-[#06b6d4]/10 rounded-lg">
            <AdjustmentsHorizontalIcon className="h-8 w-8 text-[#06b6d4]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 [:root[data-theme=dark]_&]:text-white">
              {t("page.title")}
            </h1>
            <p className="text-sm text-gray-500 [:root[data-theme=dark]_&]:text-gray-400">
              {t("page.subtitle")}
            </p>
          </div>
        </div>

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

        <EditStrategyPanel
          editTarget={editTarget}
          onUpdate={onUpdate}
          onClose={() => setEditTarget(null)}
        />
      </div>
    </div>
  );
}
