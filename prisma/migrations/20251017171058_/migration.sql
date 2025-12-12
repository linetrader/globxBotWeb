/*
  Warnings:

  - You are about to drop the column `entryForwardEnabled` on the `StrategyConfig` table. All the data in the column will be lost.
  - You are about to drop the column `martinOnLossWebsea` on the `StrategyConfig` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "StrategyConfig" DROP COLUMN "entryForwardEnabled",
DROP COLUMN "martinOnLossWebsea";
