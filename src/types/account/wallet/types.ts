// =============================================
// FILE: types/account/wallet/types.ts
// =============================================
export type UpdateWalletRequest = {
  address: string; // EVM checksum address
  otpCode: string; // 6 digits
};

export type UpdateWalletResponse =
  | { ok: true; wallet: { withdrawAddress: string } }
  | { ok: false; code: string; message?: string };

export type WalletFormProps = {
  email: string; // 부모에서 전달되지만 이 컴포넌트 내부에선 미사용
  otpEnabled: boolean;
  wallet: string;
  onChangeWallet: (v: string) => void;
};

// ---- ethers v5(utils.getAddress) / v6(getAddress) 모두 지원 (no require) ----
export type EthersV6 = { getAddress: (a: string) => string };
export type EthersV5 = { utils: { getAddress: (a: string) => string } };
