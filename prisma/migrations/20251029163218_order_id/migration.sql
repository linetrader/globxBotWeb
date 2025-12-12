/*
  Warnings:

  - Added the required column `exchange` to the `Trade` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Trade" ADD COLUMN     "exchange" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "TradeEvent" ADD COLUMN     "orderId" TEXT;

-- CreateTable
CREATE TABLE "BotRunnerHeartbeat" (
    "botId" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "hostname" TEXT,
    "pid" INTEGER,
    "tickAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BotRunnerHeartbeat_pkey" PRIMARY KEY ("botId","workerId","runId")
);

-- CreateIndex
CREATE INDEX "BotRunnerHeartbeat_botId_tickAt_idx" ON "BotRunnerHeartbeat"("botId", "tickAt");

-- CreateIndex
CREATE INDEX "BotRunnerHeartbeat_tickAt_idx" ON "BotRunnerHeartbeat"("tickAt");

-- CreateIndex
CREATE INDEX "Trade_exchange_openedAt_idx" ON "Trade"("exchange", "openedAt");

-- CreateIndex
CREATE INDEX "TradeEvent_orderId_timestamp_idx" ON "TradeEvent"("orderId", "timestamp");
