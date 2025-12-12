// src/app/(site)/strategy-config/view/EditStrategyPanel.tsx
"use client";

import { useEditStrategyForm } from "../hooks/useEditStrategyForm";
import { StrategyItem, StrategyUpdateBody } from "../types";
import EditStrategyFormView from "./EditStrategyFormView";

type OuterProps = {
  editTarget: StrategyItem | null;
  onUpdate: (body: StrategyUpdateBody) => Promise<void>;
  onClose: () => void;
};

type InnerProps = {
  item: StrategyItem;
  onUpdate: (body: StrategyUpdateBody) => Promise<void>;
  onClose: () => void;
};

function EditStrategyPanelInner({ item, onUpdate, onClose }: InnerProps) {
  const editHook = useEditStrategyForm({
    item,
    onUpdate,
    onClose,
  });

  return (
    <EditStrategyFormView
      form={editHook.form}
      setForm={editHook.setForm}
      updating={editHook.updating}
      disabled={editHook.disabled}
      onUpdateClick={editHook.onUpdateClick}
      onClose={editHook.onClose}
    />
  );
}

export default function EditStrategyPanel({
  editTarget,
  onUpdate,
  onClose,
}: OuterProps) {
  if (editTarget === null) return null;
  return (
    <EditStrategyPanelInner
      item={editTarget}
      onUpdate={onUpdate}
      onClose={onClose}
    />
  );
}
