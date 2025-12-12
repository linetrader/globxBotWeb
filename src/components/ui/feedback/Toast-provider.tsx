// src/components/ui/feedback/Toast-provider.tsx
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";
import { createPortal } from "react-dom";
import { Toast, type ToastPosition, type ToastVariant } from "./Toast";

export type ToastItem = {
  id: number;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  position?: ToastPosition;
  /** 자동 닫힘(ms). 0 또는 undefined면 자동 닫힘 없음 */
  duration?: number;
  /** 닫기 버튼 표시 여부 */
  closable?: boolean;
};

type ToastApi = {
  /** 생성하고 id 반환 */
  toast: (opts: Omit<ToastItem, "id">) => number;
  /** 특정 토스트 닫기 */
  dismiss: (id: number) => void;
  /** 모두 닫기 */
  clear: () => void;
};

const ToastCtx = createContext<ToastApi | null>(null);

export function ToastProvider({ children }: PropsWithChildren) {
  const idRef = useRef<number>(1);
  const [items, setItems] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const toast = useCallback(
    (opts: Omit<ToastItem, "id">) => {
      const id = idRef.current++;
      const item: ToastItem = {
        id,
        title: opts.title,
        description: opts.description,
        variant: opts.variant ?? "info",
        position: opts.position ?? "top-right",
        duration: opts.duration ?? 3000,
        closable: opts.closable ?? true,
      };
      setItems((prev) => [...prev, item]);

      // 자동 닫힘
      if (item.duration && item.duration > 0) {
        window.setTimeout(() => dismiss(id), item.duration);
      }
      return id;
    },
    [dismiss]
  );

  const api = useMemo<ToastApi>(
    () => ({ toast, dismiss, clear }),
    [toast, dismiss, clear]
  );

  return (
    <ToastCtx.Provider value={api}>
      {children}
      <Toaster items={items} onClose={dismiss} />
    </ToastCtx.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastCtx);
  if (!ctx) {
    throw new Error("useToast must be used within <ToastProvider>");
  }
  return ctx;
}

/** 포털로 실제 토스트를 화면 구석에 렌더링 */
function Toaster({
  items,
  onClose,
}: {
  items: ToastItem[];
  onClose: (id: number) => void;
}) {
  if (typeof document === "undefined") return null; // SSR 안전

  // 위치별 스택 나누기 (any 제거: Partial<Record<ToastPosition, ToastItem[]>> 사용)
  const groupByPos: Partial<Record<ToastPosition, ToastItem[]>> = {};
  for (const it of items) {
    const pos: ToastPosition = it.position ?? "top-right";
    if (!groupByPos[pos]) groupByPos[pos] = [];
    groupByPos[pos]!.push(it);
  }

  // Object.entries의 타입 보강 (캐스팅이지만 any가 아닌 구체 타입)
  const entries = Object.entries(groupByPos) as Array<
    [ToastPosition, ToastItem[]]
  >;

  return createPortal(
    <>
      {entries.map(([position, list]) => (
        <div key={position} className="pointer-events-none">
          {/* 최신이 아래로 쌓이게 그대로 map. 필요시 reverse() */}
          {list.map((t) => (
            <Toast
              key={t.id}
              position={position}
              variant={t.variant}
              className="pointer-events-auto"
            >
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  {t.title ? (
                    <div className="font-semibold">{t.title}</div>
                  ) : null}
                  {t.description ? (
                    <div className="text-sm opacity-90">{t.description}</div>
                  ) : null}
                </div>
                {t.closable ? (
                  <button
                    className="btn btn-ghost btn-xs"
                    onClick={() => onClose(t.id)}
                    aria-label="닫기"
                  >
                    ✕
                  </button>
                ) : null}
              </div>
            </Toast>
          ))}
        </div>
      ))}
    </>,
    document.body
  );
}
