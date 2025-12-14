// src/app/admin/bots/work-queue/view/CleanupPanel.tsx
"use client";

type CleanupPanelProps = {
  keepDays: string;
  setKeepDays: (v: string) => void;
  cleanupLoading: boolean;
  runCleanup: () => void;
};

export function CleanupPanel(props: CleanupPanelProps) {
  const { keepDays, setKeepDays, cleanupLoading, runCleanup } = props;

  return (
    <div className="card bg-base-100 shadow border">
      <div className="card-body p-4 gap-4">
        <h2 className="card-title text-base">SUCCEEDED 정리</h2>

        <div className="text-xs text-base-content/60">
          오늘 시점 기준으로, 지정한 일수보다 오래된{" "}
          <span className="font-semibold">SUCCEEDED</span> 작업(생성 기준)을
          일괄 삭제합니다.
        </div>

        <div className="flex flex-col md:flex-row gap-4 md:items-end">
          <label className="form-control w-full md:w-auto">
            <div className="label">
              <span className="label-text text-xs font-semibold">
                보관일수 (일)
              </span>
            </div>
            <input
              type="number"
              min={0}
              className="input input-bordered input-sm w-full md:w-24"
              value={keepDays}
              onChange={(e) => setKeepDays(e.target.value)}
            />
          </label>

          <button
            type="button"
            className={`btn btn-sm btn-error ${
              cleanupLoading ? "btn-disabled loading" : ""
            }`}
            onClick={runCleanup}
            disabled={cleanupLoading}
          >
            {cleanupLoading ? "정리 중..." : "정리 실행"}
          </button>
        </div>
      </div>
    </div>
  );
}
