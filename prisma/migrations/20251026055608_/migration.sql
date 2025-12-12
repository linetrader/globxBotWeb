-- DropForeignKey
ALTER TABLE "public"."Trade" DROP CONSTRAINT "Trade_botId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Trade" DROP CONSTRAINT "Trade_exchangeCredentialId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Trade" DROP CONSTRAINT "Trade_exchangeMarketId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TradeEvent" DROP CONSTRAINT "TradeEvent_tradeId_fkey";

-- AlterTable
ALTER TABLE "Trade" ALTER COLUMN "exchangeMarketId" DROP NOT NULL;
