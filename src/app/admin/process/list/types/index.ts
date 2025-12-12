// src/app/admin/process/list/types/index.ts
export type AliveFilter = "ALL" | "ACTIVE" | "STALE";

export interface ProcessRow {
  id: string;
  taskArn: string | null;
  revision: string | null;
  createdAt: string;
  lastHeartbeat: string | null;
  updatedAt: string;
  botCount: number;
  alive: boolean;

  // 동일 botId가 2개 이상의 workerId에 붙어 있는 충돌 의심 bot 목록
  conflictBotIds: string[];

  // 살아있는데(bot heartbeat OK) botCount가 0인 워커 → 좀비 의심
  isZombieSuspect: boolean;
}

/**
 * "해당 워커가 현재 들고 있는 봇" 1건
 * - /api/admin/process/[workerId]/bots 에서 내려주는 항목
 */
export interface WorkerBotRow {
  botId: string;
  botName: string;
  username: string;
}

export type ProcessListResponse =
  | {
      ok: true;
      data: ProcessRow[];
      page: number;
      pageSize: number;
      total: number;
    }
  | {
      ok: false;
      error: string;
    };

/**
 * /api/admin/process/[workerId]/bots 응답
 */
export type WorkerBotListResponse =
  | {
      ok: true;
      data: WorkerBotRow[];
    }
  | {
      ok: false;
      error: string;
    };

/**
 * DELETE /api/admin/process/list payload
 *
 * (1) 선택 삭제:
 *    { processIds: ["wm-...", "wm-..."] }
 *
 * (2) 전체 STALE 삭제:
 *    { deleteAllStale: true }
 *
 * 두 필드 중 하나만 보내면 된다.
 */
export interface BulkDeletePayload {
  processIds?: string[];
  deleteAllStale?: boolean;
}

export type BulkDeleteResponse =
  | {
      ok: true;
      data: {
        deleted: number;
      };
    }
  | {
      ok: false;
      error: string;
    };

/**
 * stop-all (POST /api/admin/process/[workerId]/stop-all) 응답
 */
export type StopAllResponse =
  | {
      ok: true;
      data: {
        requested: number;
        eligible: number;
        updated: number;
        stoppedOkIds: string[];
      };
    }
  | {
      ok: false;
      error: string;
    };

/**
 * useProcessList 훅에서 view 계층으로 내려주는 전체 상태/액션 컨트랙트
 */
export interface UseProcessListReturn {
  loading: boolean;
  error: string | null;

  rows: ProcessRow[];

  page: number;
  pageSize: number;
  total: number;
  setPage: (page: number) => void;

  aliveFilter: AliveFilter;
  setAliveFilter: (f: AliveFilter) => void;

  /** 현재 선택된 processIds */
  idsSelected: string[];
  toggleOne: (id: string) => void;
  toggleAll: (currentRows: ProcessRow[]) => void;
  clearSelection: () => void;

  /** 삭제 중 여부 (선택삭제/전체삭제 공용) */
  deleting: boolean;

  /** 선택된 STALE들만 삭제 */
  deleteSelected: () => Promise<void>;

  /**
   * 현재 페이지 rows 기준으로 alive === false 인 개수
   * (화면 표시에만 사용; 실제 전체삭제는 모든 페이지 STALE을 서버에서 지움)
   */
  staleDeletableCount: number;

  /**
   * 전체 STALE 삭제 (모든 페이지 대상)
   * 서버에 { deleteAllStale: true } 로 DELETE 요청
   */
  deleteAllStale: () => Promise<void>;

  /** workerId -> true if stop-all in progress */
  stopLoadingMap: Record<string, boolean>;
  stopAllBotsForWorker: (workerId: string) => Promise<void>;

  /** 리스트 재요청 */
  refresh: () => void;
}
