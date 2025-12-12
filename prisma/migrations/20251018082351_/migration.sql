/*
  Warnings:

  - A unique constraint covering the columns `[userId,name]` on the table `TradingBot` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."uniq_user_market_symbol";

-- CreateIndex
CREATE UNIQUE INDEX "uniq_user_name" ON "TradingBot"("userId", "name");
