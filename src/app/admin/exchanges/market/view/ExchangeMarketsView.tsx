// src/app/admin/exchanges/market/view/ExchangeMarketsView.tsx
"use client";

import { useState } from "react";
import { type ExchangeMarketItem } from "../types";
import { useExchangeMarkets } from "../hooks/useExchangeMarkets";

type RowProps = {
  item: ExchangeMarketItem;
  onToggleActive: (id: string, next: boolean) => void;
  onSave: (body: {
    id: string;
    name?: string;
    restBaseUrl?: string;
    wsBaseUrl?: string;
  }) => void;
};

function Row(props: RowProps) {
  const { item, onToggleActive, onSave } = props;
  const [editing, setEditing] = useState<boolean>(false);
  const [name, setName] = useState<string>(item.name ?? "");
  const [restBaseUrl, setRestBaseUrl] = useState<string>(item.restBaseUrl);
  const [wsBaseUrl, setWsBaseUrl] = useState<string>(item.wsBaseUrl ?? "");

  return (
    <>
      <tr className="hover">
        <td className="whitespace-nowrap">{item.exchangeCode}</td>
        <td>{item.exchangeName}</td>
        <td className="whitespace-nowrap font-mono">{item.code}</td>
        <td>{item.name ?? "-"}</td>
        <td className="text-center">
          <input
            type="checkbox"
            className="toggle toggle-primary"
            checked={item.active}
            onChange={(e) => onToggleActive(item.id, e.target.checked)}
          />
        </td>
        <td className="text-right">{item.botsCount}</td>
        <td className="text-right">{item.groupExchangesCount}</td>
        <td className="whitespace-nowrap">
          {new Date(item.updatedAt).toLocaleString()}
        </td>
        <td className="text-right">
          <button className="btn btn-sm" onClick={() => setEditing((s) => !s)}>
            {editing ? "접기" : "수정"}
          </button>
        </td>
      </tr>

      {editing ? (
        <tr className="bg-base-200">
          <td colSpan={9}>
            <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">이름 (선택)</span>
                </label>
                <input
                  className="input input-bordered"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="표시용 이름"
                />
              </div>

              <div className="form-control md:col-span-2">
                <label className="label">
                  <span className="label-text">REST Base URL</span>
                </label>
                <input
                  className="input input-bordered"
                  value={restBaseUrl}
                  onChange={(e) => setRestBaseUrl(e.target.value)}
                  placeholder="https://api.example.com"
                />
              </div>

              <div className="form-control md:col-span-3">
                <label className="label">
                  <span className="label-text">WS Base URL (선택)</span>
                </label>
                <input
                  className="input input-bordered"
                  value={wsBaseUrl}
                  onChange={(e) => setWsBaseUrl(e.target.value)}
                  placeholder="wss://ws.example.com"
                />
              </div>

              <div className="md:col-span-3 flex justify-end gap-2">
                <button
                  className="btn"
                  onClick={() => {
                    setName(item.name ?? "");
                    setRestBaseUrl(item.restBaseUrl);
                    setWsBaseUrl(item.wsBaseUrl ?? "");
                    setEditing(false);
                  }}
                >
                  취소
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    onSave({
                      id: item.id,
                      name,
                      restBaseUrl,
                      wsBaseUrl,
                    });
                    setEditing(false);
                  }}
                >
                  저장
                </button>
              </div>
            </div>
          </td>
        </tr>
      ) : null}
    </>
  );
}

export function ExchangeMarketsView() {
  const vm = useExchangeMarkets();
  const {
    keyword,
    setKeyword,
    exchangeFilter,
    setExchangeFilter,
    filtered,
    loading,
    refreshing,
    errorMsg,
    refresh,
    toggleActive,
    updateRow,
    exchangeOptions,
  } = vm;

  return (
    <div className="p-4">
      <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
        <div className="text-xl font-bold">거래소 마켓 관리</div>
        <div className="join">
          <select
            className="select select-bordered join-item"
            value={exchangeFilter}
            onChange={(e) => setExchangeFilter(e.target.value)}
          >
            <option value="">전체 거래소</option>
            {exchangeOptions.map((op) => (
              <option key={op.code} value={op.code}>
                {op.name} ({op.code})
              </option>
            ))}
          </select>
          <input
            type="text"
            className="input input-bordered join-item"
            placeholder="검색 (code/name/url)"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <button
            className={`btn join-item ${refreshing ? "btn-disabled" : "btn-primary"}`}
            onClick={() => void refresh()}
            disabled={refreshing}
          >
            {refreshing ? "새로고침…" : "새로고침"}
          </button>
        </div>
      </div>

      {errorMsg.length > 0 ? (
        <div className="alert alert-error mb-4">
          <span>{errorMsg}</span>
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="table table-zebra">
          <thead>
            <tr>
              <th>거래소 코드</th>
              <th>거래소 이름</th>
              <th>마켓 코드</th>
              <th>이름</th>
              <th className="text-center">Active</th>
              <th className="text-right">Bots</th>
              <th className="text-right">Groups</th>
              <th>수정시각</th>
              <th className="text-right">액션</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9}>
                  <div className="flex items-center gap-2">
                    <span className="loading loading-spinner" />
                    <span>불러오는 중…</span>
                  </div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={9}>데이터가 없습니다.</td>
              </tr>
            ) : (
              filtered.map((item) => (
                <Row
                  key={item.id}
                  item={item}
                  onToggleActive={toggleActive}
                  onSave={updateRow}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
