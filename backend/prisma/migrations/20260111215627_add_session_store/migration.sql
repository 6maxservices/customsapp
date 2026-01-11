/*
  Warnings:

  - The values [OPEN,IN_PROGRESS,RESOLVED] on the enum `TaskStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `submissionId` on the `Task` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "TaskType" AS ENUM ('ACTION', 'SANCTION');

-- CreateEnum
CREATE TYPE "TaskCategory" AS ENUM ('LICENSE', 'CALIBRATION', 'IOW_DATA', 'OTHER');

-- CreateEnum
CREATE TYPE "TaskSeverity" AS ENUM ('MINOR', 'MAJOR', 'CRITICAL');

-- AlterEnum
BEGIN;
CREATE TYPE "TaskStatus_new" AS ENUM ('AWAITING_COMPANY', 'COMPANY_RESPONDED', 'IN_REVIEW', 'CLOSED', 'ESCALATED');
ALTER TABLE "Task" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Task" ALTER COLUMN "status" TYPE "TaskStatus_new" USING ("status"::text::"TaskStatus_new");
ALTER TYPE "TaskStatus" RENAME TO "TaskStatus_old";
ALTER TYPE "TaskStatus_new" RENAME TO "TaskStatus";
DROP TYPE "TaskStatus_old";
ALTER TABLE "Task" ALTER COLUMN "status" SET DEFAULT 'AWAITING_COMPANY';
COMMIT;

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_submissionId_fkey";

-- DropIndex
DROP INDEX "Task_submissionId_idx";

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "submissionId",
ADD COLUMN     "category" "TaskCategory" NOT NULL DEFAULT 'OTHER',
ADD COLUMN     "originSubmissionId" TEXT,
ADD COLUMN     "resolutionNotes" TEXT,
ADD COLUMN     "resolutionSubmissionId" TEXT,
ADD COLUMN     "severity" "TaskSeverity" NOT NULL DEFAULT 'MAJOR',
ADD COLUMN     "type" "TaskType" NOT NULL DEFAULT 'ACTION',
ALTER COLUMN "status" SET DEFAULT 'AWAITING_COMPANY';

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sid" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Session_sid_key" ON "Session"("sid");

-- CreateIndex
CREATE INDEX "Task_originSubmissionId_idx" ON "Task"("originSubmissionId");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_originSubmissionId_fkey" FOREIGN KEY ("originSubmissionId") REFERENCES "Submission"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_resolutionSubmissionId_fkey" FOREIGN KEY ("resolutionSubmissionId") REFERENCES "Submission"("id") ON DELETE SET NULL ON UPDATE CASCADE;
