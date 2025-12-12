-- CreateTable
CREATE TABLE "StrategyGlobalSettings" (
    "id" TEXT NOT NULL,
    "bbw_thresh" DECIMAL(8,6) NOT NULL,
    "bb_period" INTEGER NOT NULL,
    "bb_k" DECIMAL(5,2) NOT NULL,
    "trend_fast" INTEGER NOT NULL,
    "trend_slow" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StrategyGlobalSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StrategyGlobalSettingsHistory" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "settings_id" TEXT NOT NULL,
    "bbw_thresh" DECIMAL(8,6) NOT NULL,
    "bb_period" INTEGER NOT NULL,
    "bb_k" DECIMAL(5,2) NOT NULL,
    "trend_fast" INTEGER NOT NULL,
    "trend_slow" INTEGER NOT NULL,
    "version" INTEGER NOT NULL,
    "changed_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StrategyGlobalSettingsHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ix_strategy_global_is_active" ON "StrategyGlobalSettings"("is_active");

-- AddForeignKey
ALTER TABLE "StrategyGlobalSettingsHistory" ADD CONSTRAINT "StrategyGlobalSettingsHistory_settings_id_fkey" FOREIGN KEY ("settings_id") REFERENCES "StrategyGlobalSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
