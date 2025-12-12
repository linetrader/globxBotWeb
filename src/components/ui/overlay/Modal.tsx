// src/components/ui/overlay/Modal.tsx
"use client";
import { useState } from "react";
import type { ReactNode, HTMLAttributes } from "react";

export type ModalProps = {
  title?: ReactNode;
  /** 비제어 트리거 버튼(선택) */
  button?: ReactNode;
  /** 제어형 모드: 외부에서 열림/닫힘을 관리하려면 제공 */
  open?: boolean;
  onOpenChange?: (next: boolean) => void;
  /** 닫힘 방지(저장 중) */
  preventClose?: boolean;
  /** modal-box 커스터마이즈 */
  className?: string;
  /** backdrop 커스터마이즈(투명도 등) */
  backdropClassName?: string;
  children: ReactNode;
} & Omit<HTMLAttributes<HTMLDivElement>, "children">;

export function Modal({
  title = "Modal",
  button,
  open: openProp,
  onOpenChange,
  preventClose,
  className,
  backdropClassName,
  children,
  ...rest
}: ModalProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = typeof openProp === "boolean";
  const open = isControlled ? openProp! : uncontrolledOpen;

  const setOpen = (next: boolean) => {
    if (isControlled) onOpenChange?.(next);
    else setUncontrolledOpen(next);
  };

  return (
    <div {...rest}>
      {button ? (
        <button className="btn btn-primary" onClick={() => setOpen(true)}>
          {button}
        </button>
      ) : null}

      {open && (
        <dialog className="modal" open>
          <div
            className={["modal-box", className ?? ""].filter(Boolean).join(" ")}
          >
            {title ? <h3 className="font-bold text-lg">{title}</h3> : null}
            <div className={title ? "py-4" : ""}>{children}</div>
            {/* ✅ Close 버튼 제거 */}
          </div>

          <form
            method="dialog"
            className={["modal-backdrop", backdropClassName ?? ""]
              .filter(Boolean)
              .join(" ")}
            onSubmit={(e) => {
              if (preventClose) {
                e.preventDefault();
                return;
              }
              setOpen(false);
            }}
          >
            <button disabled={preventClose}>close</button>
          </form>
        </dialog>
      )}
    </div>
  );
}

export default Modal;
