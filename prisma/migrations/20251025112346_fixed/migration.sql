-- AlterTable
ALTER TABLE "WorkerGlobalSettings" ADD COLUMN     "is_local_mode" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "scale_assign_public_ip" TEXT DEFAULT 'ENABLED',
ADD COLUMN     "scale_cluster" TEXT,
ADD COLUMN     "scale_enabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "scale_launch_type" TEXT DEFAULT 'FARGATE',
ADD COLUMN     "scale_region" TEXT,
ADD COLUMN     "scale_security_groups" TEXT,
ADD COLUMN     "scale_subnets" TEXT,
ADD COLUMN     "scale_task_definition" TEXT;
