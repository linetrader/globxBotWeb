// src/app/api/admin/bots/strategy/service.ts
import type { PrismaClient } from "@/generated/prisma";
import type {
  StrategyGlobal,
  StrategyGlobalHistory,
  StrategyUpdateInput,
} from "./types";
import { StrategyUpdateSchema } from "./validation";
import {
  repoDeactivateAllActive,
  repoGetActive,
  repoGetHistory,
  repoGetMaxVersion,
  repoInsertNewActive,
  DbClient, // ✅ 추가: 공통 타입
} from "./repo";

/**
 * 활성 설정 + 히스토리 조회
 */
export async function getStrategyBundle(
  prisma: DbClient, // ✅ PrismaClient | TransactionClient 허용
  historyTake: number = 100
): Promise<{
  settings: StrategyGlobal | null;
  history: StrategyGlobalHistory[];
}> {
  const [settings, history] = await Promise.all([
    repoGetActive(prisma),
    repoGetHistory(prisma, historyTake),
  ]);
  return { settings, history };
}

/**
 * 새 글로벌 설정을 활성으로 교체 (트랜잭션)
 * - 기존 활성 비활성화
 * - version = (maxVersion + 1)
 * - 새로운 활성 레코드 생성
 * - 히스토리는 DB 트리거로 기록(트리거 없는 환경이라면, 여기서 OLD 값을 직접 insert 필요)
 */
export async function replaceActiveStrategy(
  prisma: DbClient, // ✅ PrismaClient | TransactionClient 허용
  input: StrategyUpdateInput
): Promise<StrategyGlobal> {
  const parsed = StrategyUpdateSchema.safeParse(input);
  if (!parsed.success) {
    const message = parsed.error.issues.map((i) => i.message).join(", ");
    throw new Error(message);
  }
  const v = parsed.data;

  const created = await (prisma as PrismaClient).$transaction(async (tx) => {
    // tx는 TransactionClient지만, repo 계층이 DbClient를 받으므로 그대로 전달 가능
    await repoDeactivateAllActive(tx);
    const maxVersion = await repoGetMaxVersion(tx);
    const nextVersion = maxVersion + 1;
    const row = await repoInsertNewActive(tx, v, nextVersion);
    return row;
  });

  return created;
}
