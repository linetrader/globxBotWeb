// src/app/admin/bots/work-queue/types/list.ts
export type StatusFilter =
  | "ALL"
  | "QUEUED"
  | "IN_PROGRESS"
  | "SUCCEEDED"
  | "FAILED"
  | "CANCELED";

// 서버에서 내려오는 1줄(work item 1건 요약)
export type WorkQueueRow = {
  id: string;
  userId: string;
  username: string | null;

  botId: string | null;
  botName: string | null;

  type: string;
  status: string;
  attempts: number;

  dedupeKey: string | null;
  sqsGroupId: string | null;

  createdAt: string;
  updatedAt: string;

  lastAttemptStartedAt: string | null;
  lastAttemptFinishedAt: string | null;
  lastAttemptExitCode: number | null;
  lastAttemptError: string | null;
  lastAttemptWorkerTaskArn: string | null;
  queueDelaySec: number | null;
};

export type WorkQueueListResponseOk = {
  ok: true;
  data: WorkQueueRow[];
  total: number;
};

export type WorkQueueListResponseErr = {
  ok: false;
  error: string;
};

export type WorkQueueListResponse =
  | WorkQueueListResponseOk
  | WorkQueueListResponseErr;

// cleanup API 응답
export type CleanupResponseOk = {
  ok: true;
  deleted: number;
  cutoffIso: string;
};

export type CleanupResponseErr = {
  ok: false;
  error: string;
};

export type CleanupResponse = CleanupResponseOk | CleanupResponseErr;

// 훅이 view로 주는 데이터/액션 묶음
export type UseWorkQueueListReturn = {
  loading: boolean;
  error: string | null;

  rows: WorkQueueRow[];
  page: number;
  pageSize: number;
  total: number;

  statusFilter: StatusFilter;
  setStatusFilter: (s: StatusFilter) => void;

  // 페이지 이동
  setPage: (next: number) => void;

  // 목록 수동 새로고침
  refresh: () => void;

  // 유저 검색 UI 제어용
  usernameInput: string;
  setUsernameInput: (v: string) => void;

  // "검색" 버튼 눌렀을 때 실제 필터 적용
  applyUsernameFilter: () => void;

  // cleanup 관련
  keepDays: string;
  setKeepDays: (v: string) => void;
  cleanupLoading: boolean;
  runCleanup: () => void;
};
