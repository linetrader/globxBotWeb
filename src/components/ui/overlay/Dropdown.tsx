// src/components/ui/overlay/Dropdown.tsx
"use client";

import {
  cloneElement,
  isValidElement,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type DropdownProps = {
  trigger: ReactNode;
  children: ReactNode;
  end?: boolean;

  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (next: boolean) => void;

  triggerAsChild?: boolean;

  className?: string;
  triggerClassName?: string;
  contentClassName?: string;

  widthClassName?: string;
  maxHeightClassName?: string;
  contentStyle?: CSSProperties;

  closeOnItemClick?: boolean;
};

export function Dropdown({
  trigger,
  children,
  end,
  open,
  defaultOpen,
  onOpenChange,
  triggerAsChild,
  className,
  triggerClassName,
  contentClassName,
  widthClassName = "w-72",
  maxHeightClassName = "max-h-[70vh]",
  contentStyle,
  closeOnItemClick = true,
}: DropdownProps) {
  const isControlled = typeof open === "boolean";
  const [innerOpen, setInnerOpen] = useState<boolean>(Boolean(defaultOpen));
  const actualOpen = isControlled ? (open as boolean) : innerOpen;

  const rootRef = useRef<HTMLDivElement | null>(null);

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setInnerOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange]
  );

  // ✅ ESC/외부 클릭 닫기
  useEffect(() => {
    if (!actualOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onClick = (e: MouseEvent) => {
      const root = rootRef.current;
      if (!root) return;
      if (!root.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, [actualOpen, setOpen]);

  // ✅ 닫힐 때 focus-within 해제 (DaisyUI가 focus로 열림 유지하는 문제 방지)
  useEffect(() => {
    if (actualOpen) return;
    const root = rootRef.current;
    const active = document.activeElement as HTMLElement | null;
    if (root && active && root.contains(active)) {
      active.blur();
    }
  }, [actualOpen]);

  const triggerNode = useMemo(() => {
    const commonProps = {
      tabIndex: 0,
      "aria-expanded": actualOpen,
      "aria-haspopup": "menu" as const,
      onClick: (e: React.MouseEvent) => {
        e.stopPropagation();
        setOpen(!actualOpen);
      },
    };

    if (triggerAsChild && isValidElement(trigger)) {
      return cloneElement(trigger as ReactElement, {
        ...commonProps,
      });
    }

    return (
      <button
        type="button"
        className={["btn", triggerClassName].filter(Boolean).join(" ")}
        {...commonProps}
      >
        {trigger}
      </button>
    );
  }, [trigger, triggerAsChild, triggerClassName, actualOpen, setOpen]);

  const onContentClick = useCallback(() => {
    if (closeOnItemClick) setOpen(false);
  }, [closeOnItemClick, setOpen]);

  return (
    <div
      ref={rootRef}
      className={[
        "dropdown",
        end ? "dropdown-end" : "",
        actualOpen ? "dropdown-open" : "",
        className || "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {triggerNode}

      <div
        tabIndex={-1}
        role="menu"
        aria-hidden={!actualOpen}
        className={[
          "dropdown-content rounded-xl border border-base-300 bg-base-100 shadow-xl mt-2",
          widthClassName,
          contentClassName,
        ]
          .filter(Boolean)
          .join(" ")}
        style={contentStyle}
        onClick={onContentClick}
      >
        <div className={["overflow-auto", maxHeightClassName].join(" ")}>
          {children}
        </div>
      </div>
    </div>
  );
}
