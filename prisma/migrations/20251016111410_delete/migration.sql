/*
  Warnings:

  - You are about to drop the column `exchangeMarketId` on the `StrategyConfig` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."StrategyConfig" DROP CONSTRAINT "StrategyConfig_exchangeMarketId_fkey";

-- DropIndex
DROP INDEX "public"."StrategyConfig_exchangeMarketId_idx";

-- AlterTable
ALTER TABLE "StrategyConfig" DROP COLUMN "exchangeMarketId";
