-- CreateTable
CREATE TABLE "WorkerGlobalSettings" (
    "id" TEXT NOT NULL,
    "max_bots_per_worker" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkerGlobalSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkerGlobalSettingsHistory" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "settings_id" TEXT NOT NULL,
    "max_bots_per_worker" INTEGER NOT NULL,
    "version" INTEGER NOT NULL,
    "changed_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkerGlobalSettingsHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ix_worker_global_is_active" ON "WorkerGlobalSettings"("is_active");

-- AddForeignKey
ALTER TABLE "WorkerGlobalSettingsHistory" ADD CONSTRAINT "WorkerGlobalSettingsHistory_settings_id_fkey" FOREIGN KEY ("settings_id") REFERENCES "WorkerGlobalSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
