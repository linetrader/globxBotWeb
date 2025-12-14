// src/app/admin/bots/list/types/index.ts
export type BotModeStr = "SINGLE" | "MULTI";

export type RuntimeStatus =
  | "STOPPED"
  | "STARTING"
  | "RUNNING"
  | "STOPPING"
  | "ERROR";

export type BotRow = {
  id: string;
  userId: string;
  username: string;
  name: string;
  mode: BotModeStr;

  status: RuntimeStatus;
  running: boolean;

  workerId: string | null;
};

export type ListOk = {
  ok: true;
  data: BotRow[];
  page: number;
  pageSize: number;
  total: number;
};
export type ListErr = { ok: false; error: string };
export type ListResponse = ListOk | ListErr;

export type BulkAction = "START" | "STOP";

export type BulkUpdatePayload = {
  action: BulkAction;
  botIds: string[];
};

export type BulkUpdateOk = { ok: true; data: { updated: number } };
export type BulkUpdateErr = { ok: false; error: string };
export type BulkUpdateResponse = BulkUpdateOk | BulkUpdateErr;

export type RunningFilter = "ALL" | "RUNNING" | "STOPPED" | "ERROR";

/** 백업+전체종료 API 응답 */
export type BackupStopOk = {
  ok: true;
  backupId: string;
  count: number;
  stopped: { updated: number; requested: number; eligible: number };
};
export type BackupStopErr = { ok: false; error: string };
export type BackupStopResponse = BackupStopOk | BackupStopErr;

/** 백업 복원(1초 텀 시작) API 응답 */
export type RestoreStartOk = {
  ok: true;
  backupId: string;
  total: number;
  started: { updated: number; requested: number; eligible: number };
};
export type RestoreStartErr = { ok: false; error: string };
export type RestoreStartResponse = RestoreStartOk | RestoreStartErr;

export type UseBotsListReturn = {
  loading: boolean;
  error: string | null;
  rows: BotRow[];

  // 선택 상태
  selected: Record<string, boolean>;
  toggleOne: (botId: string) => void;
  toggleAll: (checked: boolean) => void;
  clearSelection: () => void;

  // 동작
  refresh: () => void;
  starting: boolean;
  stopping: boolean;
  startSelected: () => void;
  stopSelected: () => void;

  // 페이지네이션
  page: number;
  pageSize: number;
  total: number;
  setPage: (p: number) => void;

  // 러닝상태 필터
  runningFilter: RunningFilter;
  setRunningFilter: (f: RunningFilter) => void;

  // 유저네임 검색 UI 제어용
  usernameInput: string;
  setUsernameInput: (v: string) => void;

  // 실제 필터 적용 트리거 (검색 버튼)
  applyUsernameFilter: () => void;

  // 백업/복원
  backingUpStopping: boolean;
  restoring: boolean;
  backupAndStopAll: () => void;
  restoreBackupStart: () => void;
};
