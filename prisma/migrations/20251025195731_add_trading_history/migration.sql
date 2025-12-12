-- CreateEnum
CREATE TYPE "Side" AS ENUM ('LONG', 'SHORT');

-- CreateEnum
CREATE TYPE "MarginMode" AS ENUM ('ISOLATED', 'CROSS');

-- CreateEnum
CREATE TYPE "TradeStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateEnum
CREATE TYPE "TradeEventType" AS ENUM ('ENTRY', 'PARTIAL_EXIT', 'EXIT', 'LIQUIDATION');

-- CreateTable
CREATE TABLE "Trade" (
    "id" TEXT NOT NULL,
    "botId" TEXT NOT NULL,
    "exchangeMarketId" TEXT NOT NULL,
    "exchangeCredentialId" TEXT,
    "symbol" TEXT NOT NULL,
    "side" "Side" NOT NULL,
    "leverage" INTEGER NOT NULL,
    "marginMode" "MarginMode" NOT NULL,
    "status" "TradeStatus" NOT NULL DEFAULT 'OPEN',
    "entryQty" INTEGER NOT NULL,
    "entryCostUsdt" DECIMAL(38,18),
    "entryPrice" DECIMAL(38,18),
    "entryNotionalUsdt" DECIMAL(38,18),
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closeQty" INTEGER,
    "closePrice" DECIMAL(38,18),
    "closeNotionalUsdt" DECIMAL(38,18),
    "realizedPnlUsdt" DECIMAL(38,18),
    "realizedRoiPct" DECIMAL(38,18),
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TradeEvent" (
    "id" TEXT NOT NULL,
    "tradeId" TEXT NOT NULL,
    "type" "TradeEventType" NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "botId" TEXT NOT NULL,
    "exchangeMarketId" TEXT NOT NULL,
    "exchangeCredentialId" TEXT,
    "symbol" TEXT NOT NULL,
    "side" "Side" NOT NULL,
    "leverage" INTEGER NOT NULL,
    "marginMode" "MarginMode" NOT NULL,
    "qty" INTEGER NOT NULL,
    "price" DECIMAL(38,18),
    "notionalUsdt" DECIMAL(38,18),
    "costUsdt" DECIMAL(38,18),
    "realizedPnlUsdt" DECIMAL(38,18),
    "realizedRoiPct" DECIMAL(38,18),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TradeEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Trade_botId_status_openedAt_idx" ON "Trade"("botId", "status", "openedAt");

-- CreateIndex
CREATE INDEX "Trade_exchangeCredentialId_openedAt_idx" ON "Trade"("exchangeCredentialId", "openedAt");

-- CreateIndex
CREATE INDEX "Trade_exchangeMarketId_status_closedAt_idx" ON "Trade"("exchangeMarketId", "status", "closedAt");

-- CreateIndex
CREATE INDEX "TradeEvent_tradeId_timestamp_idx" ON "TradeEvent"("tradeId", "timestamp");

-- CreateIndex
CREATE INDEX "TradeEvent_botId_exchangeMarketId_timestamp_idx" ON "TradeEvent"("botId", "exchangeMarketId", "timestamp");

-- CreateIndex
CREATE INDEX "TradeEvent_type_timestamp_idx" ON "TradeEvent"("type", "timestamp");

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_botId_fkey" FOREIGN KEY ("botId") REFERENCES "TradingBot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_exchangeMarketId_fkey" FOREIGN KEY ("exchangeMarketId") REFERENCES "ExchangeMarket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_exchangeCredentialId_fkey" FOREIGN KEY ("exchangeCredentialId") REFERENCES "ExchangeCredential"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradeEvent" ADD CONSTRAINT "TradeEvent_tradeId_fkey" FOREIGN KEY ("tradeId") REFERENCES "Trade"("id") ON DELETE CASCADE ON UPDATE CASCADE;
