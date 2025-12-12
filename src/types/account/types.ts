// =============================================
// FILE: types/account/types.ts (공통)
// =============================================
export type CountryLite = { code: string; name: string } | null;

export type AccountProfile = {
  username: string;
  email: string;
  name: string;
  referralCode: string;
  googleOtpEnabled: boolean;
  country?: CountryLite;
  wallet?: { withdrawAddress?: string | null } | null;
};

export type ApiOk<T> = { ok: true } & T;
export type ApiErr = { ok: false; code: string; message?: string };
export type ApiRes<T> = ApiOk<T> | ApiErr;

export type AccountInfoProps = {
  username: string;
  email: string;
  name: string;
  countryLabel: string; // "Korea, Republic of (KR)" 형태 또는 "-" 등
};

export type ReferralCodeProps = {
  /** 회원가입 레퍼럴 링크 전체 URL */
  refLink: string;
  onCopy: () => void;
};

export type ProfileState = {
  username: string;
  email: string;
  name: string;
  countryCode: string | null;
  countryName: string | null;
  wallet: string;
  refCode: string;
  otpEnabled: boolean;
  otpSecret: string;
  otpQr: string;
};
