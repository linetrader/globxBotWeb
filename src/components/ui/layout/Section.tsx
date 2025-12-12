// src/components/ui/layout/Section.tsx
"use client";
import type { ReactNode, HTMLAttributes } from "react";

/** 공통 속성 */
type BaseProps = {
  title?: ReactNode;
  actions?: ReactNode;
  className?: string;
  headerClassName?: string;
  titleClassName?: string;
} & Omit<HTMLAttributes<HTMLElement>, "children">;

/** 1) 기본(stack) 모드 */
type StackProps = BaseProps & {
  layout?: "stack";
  children: ReactNode;
};

/** 2) two-col 모드 (children 미사용) */
type TwoColProps = BaseProps & {
  layout: "two-col";
  left: ReactNode;
  right: ReactNode;
  columnsTemplate?: string; // e.g. "1fr auto"
  contentClassName?: string; // 내부 grid 클래스
  children?: never;
};

export type SectionProps = StackProps | TwoColProps;

function isTwoCol(p: SectionProps): p is TwoColProps {
  return (p as TwoColProps).layout === "two-col";
}

export function Section(props: SectionProps) {
  // 공통 헤더 렌더링을 위해 먼저 필요한 값만 뽑음
  const {
    /* eslint-disable @typescript-eslint/no-unused-vars */ title,
    actions,
    className,
    headerClassName,
    titleClassName,
  } = props;

  // 사용자 정의 prop을 제거한 뒤에만 DOM에 전달될 props 구성
  let domProps: HTMLAttributes<HTMLElement>;
  if (isTwoCol(props)) {
    // two-col: 사용자 정의 키들 + 헤더 관련 키 제거
    const {
      title: _t,
      actions: _a,
      className: _c,
      headerClassName: _hc,
      titleClassName: _tc,
      layout: _l,
      left: _left,
      right: _right,
      columnsTemplate: _ct,
      contentClassName: _cc,
      ...rest
    } = props;
    domProps = rest;
  } else {
    // stack: 헤더 관련 키 + layout 제거
    const {
      title: _t,
      actions: _a,
      className: _c,
      headerClassName: _hc,
      titleClassName: _tc,
      layout: _l,
      ...rest
    } = props;
    domProps = rest;
  }

  const hasHeader = Boolean(title) || Boolean(actions);

  const rootCls = [hasHeader ? "space-y-3" : "space-y-0", className]
    .filter(Boolean)
    .join(" ");

  const hdrCls = ["flex items-center justify-between", headerClassName]
    .filter(Boolean)
    .join(" ");

  const ttlCls = ["text-lg font-semibold", titleClassName]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={rootCls} {...domProps}>
      {hasHeader ? (
        <div className={hdrCls}>
          {title ? <h2 className={ttlCls}>{title}</h2> : <span />}
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </div>
      ) : null}

      {isTwoCol(props) ? (
        <div
          className={["grid", props.contentClassName ?? ""]
            .filter(Boolean)
            .join(" ")}
          style={{ gridTemplateColumns: props.columnsTemplate ?? "1fr auto" }}
        >
          {props.left}
          {props.right}
        </div>
      ) : (
        props.children
      )}
    </section>
  );
}

export default Section;
