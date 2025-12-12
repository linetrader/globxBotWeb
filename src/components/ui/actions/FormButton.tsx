// src/components/ui/actions/FormButton.tsx
"use client";

import { useFormStatus } from "react-dom";
import Button, { ButtonProps } from "./Button";

export type FormButtonProps = Omit<
  ButtonProps,
  "onClick" | "type" | "loading"
> & {
  /** pending일 때 버튼 텍스트를 대체 */
  pendingText?: string;
};

export function FormButton({
  pendingText,
  disabled,
  children,
  ...rest
}: FormButtonProps) {
  const { pending } = useFormStatus(); // 부모 <form>의 제출 상태
  return (
    <Button
      type="submit"
      disabled={disabled || pending}
      loading={pending}
      {...rest}
    >
      {pending && pendingText ? pendingText : children}
    </Button>
  );
}

export default FormButton;
