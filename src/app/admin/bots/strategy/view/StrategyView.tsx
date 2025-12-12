"use client";

import type { UseStrategyReturn } from "../types";

function Field(props: {
  label: string;
  type: "number";
  step: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const { label, type, step, value, onChange } = props;
  return (
    <label className="form-control">
      <span className="label-text">{label}</span>
      <input
        className="input input-bordered"
        type={type}
        step={step}
        value={value}
        onChange={(e) => onChange(e.currentTarget.value)}
      />
    </label>
  );
}

function HistoryTable(props: { rows: UseStrategyReturn["history"] }) {
  const { rows } = props;
  return (
    <div className="overflow-x-auto">
      <table className="table table-compact">
        <thead>
          <tr>
            <th>version</th>
            <th>bbw_thresh</th>
            <th>bb_period</th>
            <th>bb_k</th>
            <th>trend_fast</th>
            <th>trend_slow</th>
            <th>changed_at</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((h) => (
            <tr key={h.id}>
              <td>{h.version}</td>
              <td>{h.bbw_thresh}</td>
              <td>{h.bb_period}</td>
              <td>{h.bb_k}</td>
              <td>{h.trend_fast}</td>
              <td>{h.trend_slow}</td>
              <td>{h.changed_at}</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={7} className="text-center">
                히스토리가 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default function StrategyView(props: UseStrategyReturn) {
  const {
    loading,
    saving,
    error,
    settings,
    history,
    form,
    setField,
    refresh,
    save,
  } = props;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">어드민 · 글로벌 전략 설정</h1>

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      <div className="card bg-base-100 shadow">
        <div className="card-body space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Field
              label="bbw_thresh"
              type="number"
              step="0.000001"
              value={form.bbw_thresh}
              onChange={(v) => setField("bbw_thresh", v)}
            />
            <Field
              label="bb_period"
              type="number"
              step="1"
              value={form.bb_period}
              onChange={(v) => setField("bb_period", v)}
            />
            <Field
              label="bb_k"
              type="number"
              step="0.01"
              value={form.bb_k}
              onChange={(v) => setField("bb_k", v)}
            />
            <Field
              label="trend_fast"
              type="number"
              step="1"
              value={form.trend_fast}
              onChange={(v) => setField("trend_fast", v)}
            />
            <Field
              label="trend_slow"
              type="number"
              step="1"
              value={form.trend_slow}
              onChange={(v) => setField("trend_slow", v)}
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              className="btn btn-primary"
              onClick={save}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button className="btn" onClick={refresh} disabled={loading}>
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          <div className="divider" />

          <div>
            <h3 className="font-semibold mb-2">Active</h3>
            {settings ? (
              <div className="overflow-x-auto">
                <table className="table table-zebra">
                  <thead>
                    <tr>
                      <th>version</th>
                      <th>bbw_thresh</th>
                      <th>bb_period</th>
                      <th>bb_k</th>
                      <th>trend_fast</th>
                      <th>trend_slow</th>
                      <th>updated_at</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{settings.version}</td>
                      <td>{settings.bbw_thresh}</td>
                      <td>{settings.bb_period}</td>
                      <td>{settings.bb_k}</td>
                      <td>{settings.trend_fast}</td>
                      <td>{settings.trend_slow}</td>
                      <td>{settings.updated_at}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="alert">활성 설정이 없습니다.</div>
            )}
          </div>

          <div className="mt-6">
            <h3 className="font-semibold mb-2">History (latest)</h3>
            <HistoryTable rows={history} />
          </div>
        </div>
      </div>
    </div>
  );
}
