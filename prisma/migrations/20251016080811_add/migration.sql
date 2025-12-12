CREATE EXTENSION IF NOT EXISTS citext WITH SCHEMA public;

-- CreateEnum
CREATE TYPE "EdgeType" AS ENUM ('REFERRER', 'SPONSOR');

-- CreateEnum
CREATE TYPE "StrategyKind" AS ENUM ('TREND', 'BOX');

-- CreateEnum
CREATE TYPE "Timeframe" AS ENUM ('1m', '3m', '5m', '15m', '30m', '1h', '4h', '1d');

-- CreateEnum
CREATE TYPE "BotStatus" AS ENUM ('STOPPED', 'STARTING', 'RUNNING', 'STOPPING', 'ERROR');

-- CreateEnum
CREATE TYPE "LogLevel" AS ENUM ('DEBUG', 'INFO', 'WARN', 'ERROR');

-- CreateTable
CREATE TABLE "BotLog" (
    "id" TEXT NOT NULL,
    "botId" TEXT NOT NULL,
    "level" "LogLevel" NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BotLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BotRuntime" (
    "id" TEXT NOT NULL,
    "botId" TEXT NOT NULL,
    "status" "BotStatus" NOT NULL DEFAULT 'STOPPED',
    "pid" INTEGER,
    "queueJobId" TEXT,
    "startedAt" TIMESTAMP(3),
    "stoppedAt" TIMESTAMP(3),
    "lastHeartbeat" TIMESTAMP(3),
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BotRuntime_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Country" (
    "code" CHAR(2) NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "Exchange" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "supportsFutures" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Exchange_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExchangeMarket" (
    "id" TEXT NOT NULL,
    "exchangeId" TEXT NOT NULL,
    "code" VARCHAR(16) NOT NULL,
    "name" VARCHAR(50),
    "restBaseUrl" TEXT NOT NULL,
    "wsBaseUrl" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExchangeMarket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExchangeCredential" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "exchangeId" TEXT NOT NULL,
    "apiKeyCipher" TEXT NOT NULL,
    "apiKeyIv" TEXT NOT NULL,
    "apiKeyTag" TEXT NOT NULL,
    "secretCipher" TEXT NOT NULL,
    "secretIv" TEXT NOT NULL,
    "secretTag" TEXT NOT NULL,
    "keyAlg" TEXT NOT NULL DEFAULT 'aes-256-gcm',
    "keyVersion" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExchangeCredential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReferralEdge" (
    "id" TEXT NOT NULL,
    "type" "EdgeType" NOT NULL,
    "parentId" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "position" INTEGER,
    "groupNo" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReferralEdge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StrategyConfig" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "exchangeMarketId" TEXT,
    "name" TEXT NOT NULL DEFAULT '',
    "kind" "StrategyKind" NOT NULL,
    "useMartin" BOOLEAN NOT NULL DEFAULT false,
    "martinOnLossWebsea" BOOLEAN NOT NULL DEFAULT false,
    "martinMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "entryForwardEnabled" BOOLEAN NOT NULL DEFAULT false,
    "defaultSize" INTEGER NOT NULL DEFAULT 0,
    "maxSize" INTEGER NOT NULL DEFAULT 0,
    "targetProfit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "leverage" INTEGER NOT NULL DEFAULT 1,
    "timeframe" "Timeframe" NOT NULL DEFAULT '5m',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StrategyConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrendStrategy" (
    "id" TEXT NOT NULL,
    "strategyConfigId" TEXT NOT NULL,
    "rsiLength" INTEGER NOT NULL DEFAULT 14,
    "lowerTh" DOUBLE PRECISION NOT NULL DEFAULT 30,
    "upperTh" DOUBLE PRECISION NOT NULL DEFAULT 70,
    "trendRsiUpperPullback" DOUBLE PRECISION,
    "trendRsiLowerPullback" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrendStrategy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BoxStrategy" (
    "id" TEXT NOT NULL,
    "strategyConfigId" TEXT NOT NULL,
    "boxTouchPct" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BoxStrategy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TradingBot" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(60) NOT NULL,
    "userId" TEXT NOT NULL,
    "exchangeMarketId" TEXT NOT NULL,
    "symbol" VARCHAR(40) NOT NULL,
    "strategyConfigId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TradingBot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" CITEXT NOT NULL,
    "email" CITEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "countryCode" CHAR(2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserInfo" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "referralCode" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "googleOtpEnabled" BOOLEAN NOT NULL DEFAULT false,
    "googleOtpSecret" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserWallet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "depositAddress" TEXT,
    "withdrawAddress" TEXT,
    "depositPrivCipher" TEXT,
    "depositPrivIv" TEXT,
    "depositPrivTag" TEXT,
    "depositKeyAlg" TEXT DEFAULT 'aes-256-gcm',
    "depositKeyVersion" INTEGER DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserWallet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BotLog_botId_createdAt_idx" ON "BotLog"("botId", "createdAt");

-- CreateIndex
CREATE INDEX "BotLog_level_createdAt_idx" ON "BotLog"("level", "createdAt");

-- CreateIndex
CREATE INDEX "BotRuntime_status_updatedAt_idx" ON "BotRuntime"("status", "updatedAt");

-- CreateIndex
CREATE INDEX "BotRuntime_lastHeartbeat_idx" ON "BotRuntime"("lastHeartbeat");

-- CreateIndex
CREATE INDEX "BotRuntime_queueJobId_idx" ON "BotRuntime"("queueJobId");

-- CreateIndex
CREATE UNIQUE INDEX "uniq_runtime_per_bot" ON "BotRuntime"("botId");

-- CreateIndex
CREATE UNIQUE INDEX "Exchange_code_key" ON "Exchange"("code");

-- CreateIndex
CREATE INDEX "Exchange_active_updatedAt_idx" ON "Exchange"("active", "updatedAt");

-- CreateIndex
CREATE INDEX "ExchangeMarket_exchangeId_idx" ON "ExchangeMarket"("exchangeId");

-- CreateIndex
CREATE INDEX "ExchangeMarket_active_updatedAt_idx" ON "ExchangeMarket"("active", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "uniq_exchange_market_code" ON "ExchangeMarket"("exchangeId", "code");

-- CreateIndex
CREATE INDEX "ExchangeCredential_exchangeId_idx" ON "ExchangeCredential"("exchangeId");

-- CreateIndex
CREATE INDEX "ExchangeCredential_userId_idx" ON "ExchangeCredential"("userId");

-- CreateIndex
CREATE INDEX "ExchangeCredential_userId_createdAt_idx" ON "ExchangeCredential"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "uniq_user_exchange_credential" ON "ExchangeCredential"("userId", "exchangeId");

-- CreateIndex
CREATE INDEX "ReferralEdge_parentId_type_idx" ON "ReferralEdge"("parentId", "type");

-- CreateIndex
CREATE INDEX "ReferralEdge_childId_type_idx" ON "ReferralEdge"("childId", "type");

-- CreateIndex
CREATE INDEX "ReferralEdge_parentId_createdAt_idx" ON "ReferralEdge"("parentId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "uniq_direct_parent_per_tree" ON "ReferralEdge"("childId", "type");

-- CreateIndex
CREATE INDEX "StrategyConfig_userId_idx" ON "StrategyConfig"("userId");

-- CreateIndex
CREATE INDEX "StrategyConfig_exchangeMarketId_idx" ON "StrategyConfig"("exchangeMarketId");

-- CreateIndex
CREATE INDEX "StrategyConfig_userId_kind_enabled_updatedAt_idx" ON "StrategyConfig"("userId", "kind", "enabled", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "uniq_user_strategy_scope" ON "StrategyConfig"("userId", "exchangeMarketId");

-- CreateIndex
CREATE UNIQUE INDEX "uniq_user_strategy_name" ON "StrategyConfig"("userId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "TrendStrategy_strategyConfigId_key" ON "TrendStrategy"("strategyConfigId");

-- CreateIndex
CREATE INDEX "TrendStrategy_updatedAt_idx" ON "TrendStrategy"("updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "BoxStrategy_strategyConfigId_key" ON "BoxStrategy"("strategyConfigId");

-- CreateIndex
CREATE INDEX "BoxStrategy_updatedAt_idx" ON "BoxStrategy"("updatedAt");

-- CreateIndex
CREATE INDEX "TradingBot_strategyConfigId_idx" ON "TradingBot"("strategyConfigId");

-- CreateIndex
CREATE INDEX "TradingBot_userId_idx" ON "TradingBot"("userId");

-- CreateIndex
CREATE INDEX "TradingBot_exchangeMarketId_idx" ON "TradingBot"("exchangeMarketId");

-- CreateIndex
CREATE INDEX "TradingBot_userId_enabled_updatedAt_idx" ON "TradingBot"("userId", "enabled", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "uniq_user_market_symbol" ON "TradingBot"("userId", "exchangeMarketId", "symbol");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_countryCode_idx" ON "User"("countryCode");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserInfo_userId_key" ON "UserInfo"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserInfo_referralCode_key" ON "UserInfo"("referralCode");

-- CreateIndex
CREATE UNIQUE INDEX "UserWallet_userId_key" ON "UserWallet"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserWallet_depositAddress_key" ON "UserWallet"("depositAddress");

-- CreateIndex
CREATE UNIQUE INDEX "UserWallet_withdrawAddress_key" ON "UserWallet"("withdrawAddress");

-- AddForeignKey
ALTER TABLE "BotLog" ADD CONSTRAINT "BotLog_botId_fkey" FOREIGN KEY ("botId") REFERENCES "TradingBot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BotRuntime" ADD CONSTRAINT "BotRuntime_botId_fkey" FOREIGN KEY ("botId") REFERENCES "TradingBot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExchangeMarket" ADD CONSTRAINT "ExchangeMarket_exchangeId_fkey" FOREIGN KEY ("exchangeId") REFERENCES "Exchange"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExchangeCredential" ADD CONSTRAINT "ExchangeCredential_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExchangeCredential" ADD CONSTRAINT "ExchangeCredential_exchangeId_fkey" FOREIGN KEY ("exchangeId") REFERENCES "Exchange"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferralEdge" ADD CONSTRAINT "ReferralEdge_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferralEdge" ADD CONSTRAINT "ReferralEdge_childId_fkey" FOREIGN KEY ("childId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StrategyConfig" ADD CONSTRAINT "StrategyConfig_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StrategyConfig" ADD CONSTRAINT "StrategyConfig_exchangeMarketId_fkey" FOREIGN KEY ("exchangeMarketId") REFERENCES "ExchangeMarket"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrendStrategy" ADD CONSTRAINT "TrendStrategy_strategyConfigId_fkey" FOREIGN KEY ("strategyConfigId") REFERENCES "StrategyConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoxStrategy" ADD CONSTRAINT "BoxStrategy_strategyConfigId_fkey" FOREIGN KEY ("strategyConfigId") REFERENCES "StrategyConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradingBot" ADD CONSTRAINT "TradingBot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradingBot" ADD CONSTRAINT "TradingBot_exchangeMarketId_fkey" FOREIGN KEY ("exchangeMarketId") REFERENCES "ExchangeMarket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradingBot" ADD CONSTRAINT "TradingBot_strategyConfigId_fkey" FOREIGN KEY ("strategyConfigId") REFERENCES "StrategyConfig"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_countryCode_fkey" FOREIGN KEY ("countryCode") REFERENCES "Country"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInfo" ADD CONSTRAINT "UserInfo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserWallet" ADD CONSTRAINT "UserWallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
