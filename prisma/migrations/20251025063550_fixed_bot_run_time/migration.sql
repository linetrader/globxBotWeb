-- AlterTable
ALTER TABLE "BotRuntime" ADD COLUMN     "lastTickAt" TIMESTAMP(3),
ADD COLUMN     "tickDriftSec" DOUBLE PRECISION,
ADD COLUMN     "userTickSec" INTEGER;

-- CreateIndex
CREATE INDEX "idx_runtime_drift" ON "BotRuntime"("tickDriftSec");
