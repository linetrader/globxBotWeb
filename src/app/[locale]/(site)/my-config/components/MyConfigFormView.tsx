"use client";

import type React from "react";
import type { UseMyConfigReturn } from "../hooks/useMyConfig";
import { ExchangeOption, EXCHANGES } from "@/types/options";
import { useTranslations } from "next-intl";
import { KeyIcon, CheckIcon } from "@heroicons/react/24/outline";

type Props = { vm: UseMyConfigReturn };

export function MyConfigFormView({ vm }: Props) {
  const t = useTranslations("my-config");
  const {
    form,
    setForm,
    saving,
    deleting,
    errorMsg,
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

  // [수정] 공통 스타일 (라이트/다크 분기)
  const inputClass =
    "input input-bordered w-full transition-colors h-10 text-sm " +
    "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-[#06b6d4] focus:outline-none " +
    "[:root[data-theme=dark]_&]:bg-[#0B1222] [:root[data-theme=dark]_&]:border-gray-700 [:root[data-theme=dark]_&]:text-gray-200 [:root[data-theme=dark]_&]:placeholder:text-gray-600";

  const labelClass =
    "label-text text-xs font-medium mb-1 block " +
    "text-gray-600 [:root[data-theme=dark]_&]:text-gray-400";

  return (
    // [수정] 카드 컨테이너 스타일
    <div className="h-full flex flex-col rounded-2xl shadow-xl overflow-hidden border transition-colors bg-white border-gray-200 [:root[data-theme=dark]_&]:bg-[#131B2D] [:root[data-theme=dark]_&]:border-gray-800">
      <div className="p-5 border-b flex items-center gap-2 transition-colors bg-gray-50 border-gray-200 [:root[data-theme=dark]_&]:bg-[#0B1222]/30 [:root[data-theme=dark]_&]:border-gray-800">
        <KeyIcon className="h-5 w-5 text-[#06b6d4]" />
        <h2 className="text-base font-bold text-gray-900 [:root[data-theme=dark]_&]:text-gray-200">
          {t("form.title")}
        </h2>
      </div>

      <div className="p-5 flex-1 flex flex-col gap-4">
        {/* 활성화 토글 */}
        <div className="form-control p-3 rounded-lg border flex flex-row items-center justify-between transition-colors bg-gray-50 border-gray-200 [:root[data-theme=dark]_&]:bg-[#0B1222] [:root[data-theme=dark]_&]:border-gray-800">
          <span className="text-sm font-medium text-gray-700 [:root[data-theme=dark]_&]:text-gray-300">
            {t("field.enabled")}
          </span>
          <input
            type="checkbox"
            className="toggle toggle-sm toggle-success border-gray-300 bg-gray-200 checked:bg-[#06b6d4] checked:border-[#06b6d4] [:root[data-theme=dark]_&]:border-gray-600 [:root[data-theme=dark]_&]:bg-gray-700"
            checked={form.enabled}
            onChange={(e) =>
              setForm((s) => ({ ...s, enabled: e.target.checked }))
            }
          />
        </div>

        {/* 거래소 선택 */}
        <div>
          <label className={labelClass}>{t("field.exchange")}</label>
          <select
            className="select select-bordered w-full transition-colors h-10 text-sm bg-white border-gray-300 text-gray-900 focus:border-[#06b6d4] [:root[data-theme=dark]_&]:bg-[#0B1222] [:root[data-theme=dark]_&]:border-gray-700 [:root[data-theme=dark]_&]:text-gray-200"
            value={form.exchangeId}
            onChange={(e) =>
              setForm((s) => ({ ...s, exchangeId: e.target.value }))
            }
          >
            <option value="" disabled>
              {t("placeholder.selectExchange")}
            </option>
            {EXCHANGES.map((ex: ExchangeOption) => (
              <option key={ex.id} value={ex.id}>
                {ex.name}
              </option>
            ))}
          </select>
        </div>

        {/* 입력 필드들 */}
        <div>
          <label htmlFor="uid" className={labelClass}>
            {t("field.uid")}
          </label>
          <input
            id="uid"
            className={inputClass}
            value={form.uid}
            placeholder={t("placeholder.uid")}
            onChange={
              handleUidChange as React.ChangeEventHandler<HTMLInputElement>
            }
          />
        </div>

        <div>
          <label htmlFor="apiKey" className={labelClass}>
            {t("field.apiKey")}
          </label>
          <input
            id="apiKey"
            type="password"
            className={inputClass}
            value={form.apiKey}
            placeholder={t("placeholder.apiKey")}
            onChange={
              handleApiKeyChange as React.ChangeEventHandler<HTMLInputElement>
            }
          />
        </div>

        <div>
          <label htmlFor="apiSecret" className={labelClass}>
            {t("field.apiSecret")}
          </label>
          <input
            id="apiSecret"
            type="password"
            className={inputClass}
            value={form.apiSecret}
            placeholder={t("placeholder.apiSecret")}
            onChange={
              handleApiSecretChange as React.ChangeEventHandler<HTMLInputElement>
            }
          />
        </div>

        {isKucoin && (
          <div>
            <label htmlFor="apiPassphrase" className={labelClass}>
              {t("field.passphrase")}
            </label>
            <input
              id="apiPassphrase"
              type="password"
              className={inputClass}
              value={form.passphrase}
              placeholder={t("placeholder.passphrase")}
              onChange={
                handlePassphraseChange as React.ChangeEventHandler<HTMLInputElement>
              }
            />
            <p className="text-[10px] text-yellow-600 mt-1 ml-1 [:root[data-theme=dark]_&]:text-yellow-500/80">
              * {t("message.kucoinNotice")}
            </p>
          </div>
        )}

        {errorMsg && (
          <div className="rounded-lg p-3 text-xs bg-red-50 border border-red-200 text-red-600 [:root[data-theme=dark]_&]:bg-red-500/10 [:root[data-theme=dark]_&]:border-red-500/20 [:root[data-theme=dark]_&]:text-red-400">
            {errorMsg}
          </div>
        )}

        {/* 하단 버튼 */}
        <div className="mt-auto pt-4 flex gap-2">
          <button
            type="button"
            className="btn btn-primary flex-1 bg-[#06b6d4] hover:bg-[#0891b2] border-none text-white font-bold h-10 min-h-0 shadow-md shadow-cyan-500/20 [:root[data-theme=dark]_&]:shadow-cyan-900/20"
            disabled={saving}
            onClick={() => void handleSave()}
          >
            {saving ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              <>
                <CheckIcon className="h-4 w-4 mr-1" />
                {t("action.save")}
              </>
            )}
          </button>

          {selectedIds.size > 0 && (
            <button
              type="button"
              className="btn btn-error btn-outline flex-1 h-10 min-h-0 border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 disabled:border-gray-200 disabled:text-gray-300 [:root[data-theme=dark]_&]:border-red-500/50 [:root[data-theme=dark]_&]:text-red-500 [:root[data-theme=dark]_&]:hover:bg-red-500 [:root[data-theme=dark]_&]:hover:text-white [:root[data-theme=dark]_&]:disabled:border-gray-800 [:root[data-theme=dark]_&]:disabled:text-gray-600"
              disabled={deleting}
              onClick={() => void handleDeleteSelected()}
            >
              {deleting ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                t("action.deleteSelected", { count: selectedIds.size })
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
