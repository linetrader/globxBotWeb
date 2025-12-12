// =============================================
// FILE: types/account/otp/types.ts
// =============================================
export type OtpInitResponse = {
  secretBase32: string;
  otpauth: string; // otpauth:// URI
};

export type OtpRegisterBody = {
  email: string; // (중복 정보이지만 프론트에서 보냄)
  code: string; // 6 digits
};

export type OtpRegisterResponse =
  | { ok: true }
  | { ok: false; message?: string };

export type OtpDisableResponse = { ok: true } | { ok: false; message?: string };

export type OtpSectionProps = {
  email: string;
  otpEnabled: boolean;
  otpSecret: string;
  otpQr: string;
  setOtpSecret: (v: string) => void;
  setOtpQr: (v: string) => void;
  onActivated: () => void;
};
