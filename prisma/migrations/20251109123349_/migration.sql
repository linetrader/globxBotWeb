-- CreateTable
CREATE TABLE "BotBackupSet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BotBackupSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BotBackupItem" (
    "id" TEXT NOT NULL,
    "backupId" TEXT NOT NULL,
    "botId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BotBackupItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ix_botbackup_user" ON "BotBackupSet"("userId");

-- CreateIndex
CREATE INDEX "ix_botbackupitem_backup" ON "BotBackupItem"("backupId");

-- CreateIndex
CREATE INDEX "ix_botbackupitem_bot" ON "BotBackupItem"("botId");

-- CreateIndex
CREATE UNIQUE INDEX "uniq_bot_per_backup" ON "BotBackupItem"("backupId", "botId");

-- AddForeignKey
ALTER TABLE "BotBackupSet" ADD CONSTRAINT "BotBackupSet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BotBackupItem" ADD CONSTRAINT "BotBackupItem_backupId_fkey" FOREIGN KEY ("backupId") REFERENCES "BotBackupSet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BotBackupItem" ADD CONSTRAINT "BotBackupItem_botId_fkey" FOREIGN KEY ("botId") REFERENCES "TradingBot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
