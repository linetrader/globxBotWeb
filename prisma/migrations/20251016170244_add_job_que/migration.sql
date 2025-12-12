-- CreateEnum
CREATE TYPE "WorkType" AS ENUM ('START_BOT', 'STOP_BOT', 'TICK', 'REBALANCE');

-- CreateEnum
CREATE TYPE "WorkStatus" AS ENUM ('QUEUED', 'IN_PROGRESS', 'SUCCEEDED', 'FAILED', 'CANCELED');

-- CreateEnum
CREATE TYPE "NotifyStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

-- AlterTable
ALTER TABLE "BotRuntime" ADD COLUMN     "desiredState" "BotStatus",
ADD COLUMN     "workerRevision" TEXT,
ADD COLUMN     "workerTaskArn" TEXT;

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "target" TEXT,
    "payload" JSONB NOT NULL,
    "status" "NotifyStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiAuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "path" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "status" INTEGER NOT NULL,
    "ip" TEXT,
    "ua" TEXT,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "botId" TEXT,
    "type" "WorkType" NOT NULL,
    "status" "WorkStatus" NOT NULL DEFAULT 'QUEUED',
    "dedupeKey" TEXT,
    "sqsMessageId" TEXT,
    "sqsGroupId" TEXT,
    "payload" JSONB,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "nextVisibleAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkAttempt" (
    "id" TEXT NOT NULL,
    "workItemId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "workerTaskArn" TEXT,
    "exitCode" INTEGER,
    "error" TEXT,
    "logsRef" TEXT,

    CONSTRAINT "WorkAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_status_createdAt_idx" ON "Notification"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ApiAuditLog_userId_createdAt_idx" ON "ApiAuditLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ApiAuditLog_path_createdAt_idx" ON "ApiAuditLog"("path", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "WorkItem_dedupeKey_key" ON "WorkItem"("dedupeKey");

-- CreateIndex
CREATE UNIQUE INDEX "WorkItem_sqsMessageId_key" ON "WorkItem"("sqsMessageId");

-- CreateIndex
CREATE INDEX "WorkItem_userId_createdAt_idx" ON "WorkItem"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "WorkItem_status_updatedAt_idx" ON "WorkItem"("status", "updatedAt");

-- CreateIndex
CREATE INDEX "WorkItem_botId_createdAt_idx" ON "WorkItem"("botId", "createdAt");

-- CreateIndex
CREATE INDEX "WorkAttempt_workItemId_startedAt_idx" ON "WorkAttempt"("workItemId", "startedAt");

-- AddForeignKey
ALTER TABLE "WorkAttempt" ADD CONSTRAINT "WorkAttempt_workItemId_fkey" FOREIGN KEY ("workItemId") REFERENCES "WorkItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
