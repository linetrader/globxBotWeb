"use client";

import { type ExchangeListItem } from "../types";
import { useExchangesList } from "../hooks/useExchangesList";

type RowProps = {
  item: ExchangeListItem;
  onToggleActive: (id: string, next: boolean) => void;
  onToggleFutures: (id: string, next: boolean) => void;
};

function Row(props: RowProps) {
  const { item, onToggleActive, onToggleFutures } = props;

  return (
    <tr className="hover">
      <td className="whitespace-nowrap">{item.code}</td>
      <td>{item.name}</td>
      <td className="text-center">
        <input
          type="checkbox"
          className="toggle toggle-primary"
          checked={item.active}
          onChange={(e) => onToggleActive(item.id, e.target.checked)}
        />
      </td>
      <td className="text-center">
        <input
          type="checkbox"
          className="toggle toggle-secondary"
          checked={item.supportsFutures}
          onChange={(e) => onToggleFutures(item.id, e.target.checked)}
        />
      </td>
      <td className="text-right">{item.marketsCount}</td>
      <td className="text-right">{item.credentialsCount}</td>
      <td className="whitespace-nowrap">
        {new Date(item.updatedAt).toLocaleString()}
      </td>
    </tr>
  );
}

export function ExchangesListView() {
  const vm = useExchangesList();
  const {
    keyword,
    setKeyword,
    filtered,
    loading,
    refreshing,
    errorMsg,
    refresh,
    toggleActive,
    toggleFutures,
  } = vm;

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center gap-2">
        <div className="text-xl font-bold">거래소 관리</div>
        <div className="grow" />
        <div className="join">
          <input
            type="text"
            className="input input-bordered join-item"
            placeholder="검색 (코드/이름)"
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
              <th>코드</th>
              <th>이름</th>
              <th className="text-center">Active</th>
              <th className="text-center">Futures</th>
              <th className="text-right">마켓 수</th>
              <th className="text-right">자격증명 수</th>
              <th>수정시각</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7}>
                  <div className="flex items-center gap-2">
                    <span className="loading loading-spinner" />
                    <span>불러오는 중…</span>
                  </div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7}>데이터가 없습니다.</td>
              </tr>
            ) : (
              filtered.map((item) => (
                <Row
                  key={item.id}
                  item={item}
                  onToggleActive={toggleActive}
                  onToggleFutures={toggleFutures}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
