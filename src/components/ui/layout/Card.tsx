// src/components/ui/layout/Card.tsx
"use client";

import React, {
  forwardRef,
  type AnchorHTMLAttributes,
  type ElementType,
  type HTMLAttributes,
  type ReactNode,
} from "react";

/* ------------------------------ util ------------------------------ */
function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/* ------------------------------ types ----------------------------- */
type Shadow = "none" | "sm" | "md" | "lg";
type Padding = "none" | "sm" | "md" | "lg";
type Variant = "default" | "ghost" | "soft";

type BaseProps = {
  title?: ReactNode;
  subtitle?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
  bordered?: boolean;
  shadow?: Shadow;
  padding?: Padding;
  variant?: Variant;
  hoverable?: boolean;
  divider?: boolean;
  loading?: boolean;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
  children?: ReactNode;
};

type AnchorLikeProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
};

/* ------------------------------ helpers --------------------------- */
function computeCardClass({
  bordered = true,
  shadow = "sm",
  variant = "default",
  hoverable,
  className,
}: Pick<
  BaseProps,
  "bordered" | "shadow" | "variant" | "hoverable" | "className"
>): string {
  const variantCls =
    variant === "ghost"
      ? "bg-transparent"
      : variant === "soft"
      ? "bg-base-100/70"
      : "bg-base-100";
  const borderCls = bordered ? "border border-base-300" : "";
  const shadowCls =
    shadow === "none"
      ? ""
      : shadow === "lg"
      ? "shadow-lg"
      : shadow === "md"
      ? "shadow-md"
      : "shadow";
  const hoverCls = hoverable ? "transition-colors hover:bg-base-200/50" : "";
  return cx("card", variantCls, borderCls, shadowCls, hoverCls, className);
}

function padToCls(padding: Padding | undefined): string {
  switch (padding) {
    case "none":
      return "p-0";
    case "sm":
      return "p-3";
    case "lg":
      return "p-6";
    case "md":
    default:
      return "p-4";
  }
}

/* --------------------------- sub components ----------------------- */
type SectionProps = HTMLAttributes<HTMLDivElement> & { children?: ReactNode };

function Header({ children, className, ...rest }: SectionProps) {
  return (
    <div className={cx("card-header px-4 pt-4", className)} {...rest}>
      {children}
    </div>
  );
}
Header.displayName = "Card.Header";

function Title({ children, className, ...rest }: SectionProps) {
  return (
    <div className={cx("card-title", className)} {...rest}>
      {children}
    </div>
  );
}
Title.displayName = "Card.Title";

function Body({ children, className, ...rest }: SectionProps) {
  return (
    <div className={cx("card-body", className)} {...rest}>
      {children}
    </div>
  );
}
Body.displayName = "Card.Body";

function Footer({ children, className, ...rest }: SectionProps) {
  return (
    <div className={cx("card-footer px-4 pb-4", className)} {...rest}>
      {children}
    </div>
  );
}
Footer.displayName = "Card.Footer";

function Actions({ children, className, ...rest }: SectionProps) {
  return (
    <div className={cx("card-actions justify-end", className)} {...rest}>
      {children}
    </div>
  );
}
Actions.displayName = "Card.Actions";

/* ------------------------------ root ------------------------------ */
/** ✅ forwardRef에 이름 있는 함수(`function Card`)를 사용해 displayName 보장 */
const CardRoot = forwardRef<
  HTMLElement,
  BaseProps & { as?: ElementType } & Partial<AnchorLikeProps>
>(function Card(props, ref) {
  const {
    title,
    subtitle,
    description,
    actions,
    footer,
    bordered = true,
    shadow = "sm",
    padding = "md",
    variant = "default",
    hoverable,
    divider,
    loading,
    className,
    headerClassName,
    bodyClassName,
    footerClassName,
    children,
    as,
    href,
    ...rest
  } = props;

  const isAnchor = typeof href === "string" && href.length > 0;
  const RootTag: ElementType = isAnchor ? "a" : as ?? "div";
  const cardCls = computeCardClass({
    bordered,
    shadow,
    variant,
    hoverable,
    className,
  });
  const bodyPadCls = padToCls(padding);
  const showHeader = Boolean(title || subtitle || description || actions);

  return (
    <RootTag
      className={cardCls}
      href={isAnchor ? href : undefined}
      ref={ref as never}
      {...(rest as Record<string, unknown>)}
    >
      {loading ? (
        <div className="h-1 w-full bg-base-300">
          <div className="h-1 w-1/3 animate-[progress_1.2s_ease-in-out_infinite] bg-primary" />
        </div>
      ) : null}

      {showHeader ? (
        <div className={cx("px-4 pt-4", headerClassName)}>
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              {title ? <div className="card-title">{title}</div> : null}
              {subtitle ? (
                <div className="text-sm text-base-content/80">{subtitle}</div>
              ) : null}
              {description ? (
                <div className="mt-1 text-sm text-base-content/60">
                  {description}
                </div>
              ) : null}
            </div>
            {actions ? <div className="card-actions">{actions}</div> : null}
          </div>
        </div>
      ) : null}

      {divider && showHeader ? <div className="divider my-0" /> : null}

      <div className={cx("card-body", bodyPadCls, bodyClassName)}>
        {children}
      </div>

      {divider && footer ? <div className="divider my-0" /> : null}

      {footer ? (
        <div className={cx("px-4 pb-4", footerClassName)}>{footer}</div>
      ) : null}
    </RootTag>
  );
});

/* ------------------------------ export ---------------------------- */
type CardExport = typeof CardRoot & {
  Header: typeof Header;
  Title: typeof Title;
  Body: typeof Body;
  Footer: typeof Footer;
  Actions: typeof Actions;
};

export const Card: CardExport = Object.assign(CardRoot, {
  Header,
  Title,
  Body,
  Footer,
  Actions,
});

export default Card;

/* Tailwind keyframes (선택)
@keyframes progress {
  0%   { transform: translateX(-100%); width: 30%; }
  50%  { transform: translateX(50%);  width: 40%; }
  100% { transform: translateX(200%); width: 30%; }
}
*/
