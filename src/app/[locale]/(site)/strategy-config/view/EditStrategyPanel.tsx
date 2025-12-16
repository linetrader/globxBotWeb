"use client";

import { useEffect } from "react";
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

  // ESC 키로 닫기 기능
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    // [수정] 화면 전체를 덮는 모달 오버레이 (z-index 높임)
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* 백드롭 (배경 어둡게 & 블러 효과) */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* 모달 컨텐츠 컨테이너 */}
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl animate-in zoom-in-95 fade-in duration-300 scrollbar-hide">
        <EditStrategyFormView
          form={editHook.form}
          setForm={editHook.setForm}
          updating={editHook.updating}
          disabled={editHook.disabled}
          onUpdateClick={editHook.onUpdateClick}
          onClose={editHook.onClose}
        />
      </div>
    </div>
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
