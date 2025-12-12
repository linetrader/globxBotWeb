// src/server/enqueueWorkItem.ts
import prisma from "@/lib/prisma";
import { Prisma, WorkType, WorkStatus } from "@/generated/prisma";

export type EnqueueParams = {
  userId: string;
  botId: string;
  type: WorkType;
  payload: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput;
  sqsGroupId?: string | null; // default: botId
  status?: WorkStatus; // only used on brand-new create
};

// 터미널 상태의 정의
const TERMINAL_STATUSES: WorkStatus[] = [
  WorkStatus.FAILED,
  WorkStatus.SUCCEEDED,
  WorkStatus.CANCELED,
];

/** dedupeKey 규칙: `${type}:${userId}:${botId}` */
export async function enqueueWorkItem(p: EnqueueParams) {
  // 0) 소유권/존재 검증
  const bot = await prisma.tradingBot.findFirst({
    where: { id: p.botId, userId: p.userId },
    select: { id: true },
  });
  if (!bot) throw new Error("BOT_NOT_FOUND_OR_NOT_OWNED");

  const dedupeKey = `${p.type}:${p.userId}:${p.botId}`;

  // 트랜잭션으로 재시작 시나리오 포함 처리
  return await prisma.$transaction(async (tx) => {
    const existing = await tx.workItem.findUnique({
      where: { dedupeKey },
      select: {
        id: true,
        status: true,
        sqsGroupId: true,
        createdAt: true,
        updatedAt: true,
        type: true,
        dedupeKey: true,
      },
    });

    // 1) 없으면 새로 생성
    if (!existing) {
      const created = await tx.workItem.create({
        data: {
          userId: p.userId,
          botId: p.botId,
          type: p.type,
          status: p.status ?? WorkStatus.QUEUED,
          dedupeKey,
          sqsGroupId: p.sqsGroupId ?? p.botId,
          payload: p.payload,
          attempts: 0,
        },
        select: {
          id: true,
          type: true,
          status: true,
          dedupeKey: true,
          sqsGroupId: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      return { ...created, created: true as const };
    }

    // 2) 기존이 터미널 상태라면: 기존 항목의 dedupeKey를 풀고(= NULL) 새 항목을 QUEUED로 생성
    if (TERMINAL_STATUSES.includes(existing.status as WorkStatus)) {
      // 기존 키 해제: UNIQUE(dedupeKey)와 충돌하지 않도록
      await tx.workItem.update({
        where: { id: existing.id },
        data: {
          dedupeKey: null, // PostgreSQL UNIQUE는 여러 NULL 허용
          // 참고: 필요하면 보존용 태깅으로 `${dedupeKey}#${existing.id}`도 가능
        },
      });

      const created = await tx.workItem.create({
        data: {
          userId: p.userId,
          botId: p.botId,
          type: p.type,
          status: WorkStatus.QUEUED, // 재시작이므로 항상 QUEUED
          dedupeKey, // 동일 키 다시 점유
          sqsGroupId: p.sqsGroupId ?? existing.sqsGroupId ?? p.botId,
          payload: p.payload,
          attempts: 0,
        },
        select: {
          id: true,
          type: true,
          status: true,
          dedupeKey: true,
          sqsGroupId: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      return { ...created, created: true as const };
    }

    // 3) 열린 상태(QUEUED/IN_PROGRESS): 상태는 유지하고 payload/메타만 갱신(멱등)
    const updated = await tx.workItem.update({
      where: { dedupeKey },
      data: {
        // 상태는 덮지 않음
        payload: p.payload,
        sqsGroupId: p.sqsGroupId ?? existing.sqsGroupId ?? p.botId,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        type: true,
        status: true,
        dedupeKey: true,
        sqsGroupId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return { ...updated, created: false as const };
  });
}
