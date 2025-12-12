-- AlterTable
ALTER TABLE "BotRuntime" ADD COLUMN     "workerId" TEXT;

-- CreateTable
CREATE TABLE "WorkerProcess" (
    "id" TEXT NOT NULL,
    "taskArn" TEXT,
    "revision" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastHeartbeat" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkerProcess_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WorkerProcess_taskArn_idx" ON "WorkerProcess"("taskArn");

-- CreateIndex
CREATE INDEX "WorkerProcess_updatedAt_idx" ON "WorkerProcess"("updatedAt");

-- CreateIndex
CREATE INDEX "BotRuntime_workerId_idx" ON "BotRuntime"("workerId");

-- AddForeignKey
ALTER TABLE "BotRuntime" ADD CONSTRAINT "BotRuntime_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "WorkerProcess"("id") ON DELETE SET NULL ON UPDATE CASCADE;
