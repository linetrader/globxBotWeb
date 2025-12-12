-- CreateEnum
CREATE TYPE "BotMode" AS ENUM ('SINGLE', 'MULTI');

-- CreateEnum
CREATE TYPE "MarketKind" AS ENUM ('SPOT', 'FUTURES');

-- CreateEnum
CREATE TYPE "GroupKey" AS ENUM ('A', 'B');

-- AlterTable
ALTER TABLE "TradingBot" ADD COLUMN     "mode" "BotMode" NOT NULL DEFAULT 'SINGLE',
ADD COLUMN     "singleMarketKind" "MarketKind",
ALTER COLUMN "exchangeMarketId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "BotGroup" (
    "id" TEXT NOT NULL,
    "botId" TEXT NOT NULL,
    "key" "GroupKey" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BotGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BotGroupExchange" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "exchangeMarketId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "allocationBps" SMALLINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BotGroupExchange_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BotGroup_botId_key_idx" ON "BotGroup"("botId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "uniq_group_per_bot" ON "BotGroup"("botId", "key");

-- CreateIndex
CREATE INDEX "BotGroupExchange_exchangeMarketId_idx" ON "BotGroupExchange"("exchangeMarketId");

-- CreateIndex
CREATE UNIQUE INDEX "uniq_market_per_group" ON "BotGroupExchange"("groupId", "exchangeMarketId");

-- AddForeignKey
ALTER TABLE "BotGroup" ADD CONSTRAINT "BotGroup_botId_fkey" FOREIGN KEY ("botId") REFERENCES "TradingBot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BotGroupExchange" ADD CONSTRAINT "BotGroupExchange_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "BotGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BotGroupExchange" ADD CONSTRAINT "BotGroupExchange_exchangeMarketId_fkey" FOREIGN KEY ("exchangeMarketId") REFERENCES "ExchangeMarket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
