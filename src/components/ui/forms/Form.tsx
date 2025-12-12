// src/components/ui/forms/Form.tsx
"use client";

import { forwardRef } from "react";
import type { FormHTMLAttributes, ReactNode } from "react";

export type FormProps = Omit<
  FormHTMLAttributes<HTMLFormElement>,
  "children"
> & {
  children: ReactNode;
  /** 내부 패딩/그리드 등 기본 레이아웃 적용 (기본 true) */
  styled?: boolean;
};

export const Form = forwardRef<HTMLFormElement, FormProps>(function Form(
  { children, className, styled = true, ...rest },
  ref
) {
  const base = styled ? "grid grid-cols-1 gap-4" : "";
  return (
    <form
      ref={ref}
      className={[base, className ?? ""].filter(Boolean).join(" ")}
      {...rest}
    >
      {children}
    </form>
  );
});

export default Form;
