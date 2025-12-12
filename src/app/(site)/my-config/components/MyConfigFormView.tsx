// src/app/(site)/my-config/components/MyConfigFormView.tsx
"use client";

import type React from "react";
import {
  Button,
  Checkbox,
  InputField,
  LabeledField,
  SelectField,
} from "@/components/ui";
import type { UseMyConfigReturn } from "../hooks/useMyConfig";
import { ExchangeOption, EXCHANGES } from "@/types/options";

type Props = { vm: UseMyConfigReturn };

export function MyConfigFormView({ vm }: Props) {
  const {
    form,
    setForm,
    saving,
    deleting,
    errorMsg,
    exchangeLabel,
    selectedIds,
    handleSave,
    handleDeleteSelected,
    handleUidChange,
    handleApiKeyChange,
    handleApiSecretChange,
    handlePassphraseChange,
  } = vm;

  const selectedExchange: ExchangeOption | undefined = EXCHANGES.find(
    (ex) => ex.id === form.exchangeId
  );
  const isKucoin: boolean = selectedExchange?.code === "KUCOIN";

  return (
    <div className="grid grid-cols-1 gap-3">
      <h2 className="mb-3 text-base font-semibold">봇 상태 & 자격 증명</h2>

      <Checkbox
        id="enabled"
        checked={form.enabled}
        onChange={(e) => setForm((s) => ({ ...s, enabled: e.target.checked }))}
        label="봇 활성화"
      />

      <LabeledField label="거래소">
        <SelectField
          id="exchange"
          value={form.exchangeId}
          onChange={(e) =>
            setForm((s) => ({
              ...s,
              exchangeId: e.target.value,
            }))
          }
        >
          <option value="" disabled>
            거래소 선택
          </option>
          {EXCHANGES.map((ex: ExchangeOption) => (
            <option key={ex.id} value={ex.id}>
              {ex.name}
            </option>
          ))}
        </SelectField>
      </LabeledField>

      <InputField
        id="uid"
        label="거래소 UID"
        value={form.uid}
        placeholder="거래소 계정 UID (필수)"
        onChange={handleUidChange as React.ChangeEventHandler<HTMLInputElement>}
      />

      <InputField
        id="apiKey"
        label="API Key"
        value={form.apiKey}
        placeholder="거래소 API Key"
        onChange={
          handleApiKeyChange as React.ChangeEventHandler<HTMLInputElement>
        }
      />

      <InputField
        id="apiSecret"
        label="API Secret"
        value={form.apiSecret}
        placeholder="거래소 API Secret"
        onChange={
          handleApiSecretChange as React.ChangeEventHandler<HTMLInputElement>
        }
      />

      {isKucoin && (
        <InputField
          id="apiPassphrase"
          label="API Passphrase (KuCoin)"
          value={form.passphrase}
          placeholder="KuCoin API Passphrase"
          onChange={
            handlePassphraseChange as React.ChangeEventHandler<HTMLInputElement>
          }
        />
      )}

      <div className="mt-2 flex gap-2">
        <Button
          type="button"
          disabled={saving}
          onClick={() => void handleSave()}
        >
          {saving ? "저장 중…" : "저장"}
        </Button>

        <Button
          type="button"
          disabled={deleting || selectedIds.size === 0}
          onClick={() => void handleDeleteSelected()}
        >
          {deleting ? "삭제 중…" : `선택 삭제 (${selectedIds.size})`}
        </Button>
      </div>

      <p className="mt-2 text-xs text-base-content/60">선택: {exchangeLabel}</p>

      {isKucoin && (
        <p className="text-xs text-base-content/60">
          * KuCoin API는 Key / Secret / Passphrase 3가지가 모두 필요합니다.
        </p>
      )}

      {errorMsg && <p className="mt-1 text-xs text-error">{errorMsg}</p>}
    </div>
  );
}
