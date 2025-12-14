// src/app/admin/exchanges/credential/view/ExchangeCredentialsView.tsx
"use client";

import { useState } from "react";
import { useExchangeCredentials } from "../hooks/useExchangeCredentials";
import { type ExchangeCredentialUpdateBody } from "../types";

type RowProps = {
  id: string;
  username: string;
  exchangeCode: string;
  exchangeName: string;
  exchangeUid: string | null | undefined;
  updatedAt: string;
  onSave: (data: ExchangeCredentialUpdateBody) => void;
};

function Row(props: RowProps) {
  const {
    id,
    username,
    exchangeCode,
    exchangeName,
    exchangeUid,
    updatedAt,
    onSave,
  } = props;
  const [editing, setEditing] = useState<boolean>(false);
  const [uid, setUid] = useState<string>(exchangeUid ?? "");

  return (
    <>
      <tr className="hover">
        <td className="font-mono">{username}</td>
        <td className="whitespace-nowrap">{exchangeName}</td>
        <td className="whitespace-nowrap">{exchangeCode}</td>
        <td className="font-mono">{exchangeUid ?? "-"}</td>
        <td className="whitespace-nowrap">
          {new Date(updatedAt).toLocaleString()}
        </td>
        <td className="text-right">
          <button className="btn btn-sm" onClick={() => setEditing((s) => !s)}>
            {editing ? "접기" : "수정"}
          </button>
        </td>
      </tr>
      {editing ? (
        <tr className="bg-base-200">
          <td colSpan={6}>
            <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="form-control md:col-span-2">
                <label className="label">
                  <span className="label-text">거래소 UID</span>
                </label>
                <input
                  className="input input-bordered"
                  value={uid}
                  onChange={(e) => setUid(e.target.value)}
                  placeholder="거래소 계정 UID"
                />
              </div>
              <div className="md:col-span-3 flex justify-end gap-2">
                <button
                  className="btn"
                  onClick={() => {
                    setUid(exchangeUid ?? "");
                    setEditing(false);
                  }}
                >
                  취소
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    const payload: ExchangeCredentialUpdateBody = {
                      id,
                      exchangeUid: uid,
                    };
                    onSave(payload);
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

export function ExchangeCredentialsView() {
  const vm = useExchangeCredentials();
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
    updateRow,
    exchangeOptions,
  } = vm;

  return (
    <div className="p-4">
      <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
        <div className="text-xl font-bold">거래소 자격증명 관리</div>
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
            placeholder="검색 (username / code / name / uid)"
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
              <th>Username</th>
              <th>거래소 이름</th>
              <th>거래소 코드</th>
              <th>UID</th>
              <th>수정시각</th>
              <th className="text-right">액션</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6}>
                  <div className="flex items-center gap-2">
                    <span className="loading loading-spinner" />
                    <span>불러오는 중…</span>
                  </div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6}>데이터가 없습니다.</td>
              </tr>
            ) : (
              filtered.map((it) => (
                <Row
                  key={it.id}
                  id={it.id}
                  username={it.username}
                  exchangeCode={it.exchangeCode}
                  exchangeName={it.exchangeName}
                  exchangeUid={it.exchangeUid}
                  updatedAt={it.updatedAt}
                  onSave={(payload) => void updateRow(payload)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
