// src/types/account/password/types.ts
export type ChangePasswordBody = {
  currentPassword: string;
  newPassword: string;
};

// 에러 코드 타입 강화 (필요 시 서버와 동기화)
export type ChangePasswordErrorCode =
  | "UNAUTHORIZED"
  | "INVALID_INPUT"
  | "SAME_PASSWORD"
  | "NOT_FOUND"
  | "CURRENT_PASSWORD_INVALID"
  | "POLICY_LENGTH"
  | "POLICY_LETTER"
  | "POLICY_DIGIT"
  | "POLICY_UPPER"
  | "POLICY_SYMBOL"
  // 서버가 추후 확장할 수 있도록 여유 허용
  | (string & {});

export type ChangePasswordResponse =
  | { ok: true }
  | { ok: false; code: ChangePasswordErrorCode; message?: string };

// ✅ PasswordFieldProps, ErrorResp, SuccessResp 제거
