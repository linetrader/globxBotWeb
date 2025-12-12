/*
  Warnings:

  - You are about to drop the column `defaultSize` on the `StrategyConfig` table. All the data in the column will be lost.
  - You are about to drop the column `enabled` on the `StrategyConfig` table. All the data in the column will be lost.
  - You are about to drop the column `entryForwardEnabled` on the `StrategyConfig` table. All the data in the column will be lost.
  - You are about to drop the column `leverage` on the `StrategyConfig` table. All the data in the column will be lost.
  - You are about to drop the column `martinMultiplier` on the `StrategyConfig` table. All the data in the column will be lost.
  - You are about to drop the column `martinOnLossWebsea` on the `StrategyConfig` table. All the data in the column will be lost.
  - You are about to drop the column `maxSize` on the `StrategyConfig` table. All the data in the column will be lost.
  - You are about to drop the column `targetProfit` on the `StrategyConfig` table. All the data in the column will be lost.
  - You are about to drop the column `timeframe` on the `StrategyConfig` table. All the data in the column will be lost.
  - You are about to drop the column `useMartin` on the `StrategyConfig` table. All the data in the column will be lost.
  - You are about to drop the column `lowerTh` on the `TrendStrategy` table. All the data in the column will be lost.
  - You are about to drop the column `rsiLength` on the `TrendStrategy` table. All the data in the column will be lost.
  - You are about to drop the column `upperTh` on the `TrendStrategy` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."BoxStrategy_updatedAt_idx";

-- DropIndex
DROP INDEX "public"."StrategyConfig_userId_kind_enabled_updatedAt_idx";

-- DropIndex
DROP INDEX "public"."uniq_user_strategy_scope";

-- DropIndex
DROP INDEX "public"."TrendStrategy_updatedAt_idx";

-- AlterTable
ALTER TABLE "BoxStrategy" ADD COLUMN     "lowerTh" DOUBLE PRECISION NOT NULL DEFAULT 30,
ADD COLUMN     "upperTh" DOUBLE PRECISION NOT NULL DEFAULT 70;

-- AlterTable
ALTER TABLE "StrategyConfig" DROP COLUMN "defaultSize",
DROP COLUMN "enabled",
DROP COLUMN "entryForwardEnabled",
DROP COLUMN "leverage",
DROP COLUMN "martinMultiplier",
DROP COLUMN "martinOnLossWebsea",
DROP COLUMN "maxSize",
DROP COLUMN "targetProfit",
DROP COLUMN "timeframe",
DROP COLUMN "useMartin",
ADD COLUMN     "rsiLength" INTEGER NOT NULL DEFAULT 14,
ALTER COLUMN "name" DROP DEFAULT;

-- AlterTable
ALTER TABLE "TrendStrategy" DROP COLUMN "lowerTh",
DROP COLUMN "rsiLength",
DROP COLUMN "upperTh";
