-- AlterTable
ALTER TABLE "Station" ADD COLUMN     "riskScore" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "companyDecisionAt" TIMESTAMP(3),
ADD COLUMN     "companyDecisionById" TEXT,
ADD COLUMN     "forwardedAt" TIMESTAMP(3),
ADD COLUMN     "forwardedById" TEXT,
ADD COLUMN     "forwardedWithoutStationSubmit" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "forwardingExplanation" TEXT,
ADD COLUMN     "returnReason" TEXT;

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "fineAmount" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "MissingSubmission" (
    "id" TEXT NOT NULL,
    "periodId" TEXT NOT NULL,
    "stationId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT NOT NULL DEFAULT 'NO_STATION_SUBMISSION',

    CONSTRAINT "MissingSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BulkForwardBatch" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "periodId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mode" TEXT NOT NULL,
    "summaryJson" TEXT,

    CONSTRAINT "BulkForwardBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BulkForwardItem" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "stationId" TEXT NOT NULL,
    "submissionId" TEXT,
    "resultStatus" TEXT NOT NULL,
    "message" TEXT,
    "usedExplanation" TEXT,

    CONSTRAINT "BulkForwardItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MissingSubmission_companyId_idx" ON "MissingSubmission"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "MissingSubmission_periodId_stationId_key" ON "MissingSubmission"("periodId", "stationId");

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_companyDecisionById_fkey" FOREIGN KEY ("companyDecisionById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_forwardedById_fkey" FOREIGN KEY ("forwardedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MissingSubmission" ADD CONSTRAINT "MissingSubmission_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "SubmissionPeriod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MissingSubmission" ADD CONSTRAINT "MissingSubmission_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "Station"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MissingSubmission" ADD CONSTRAINT "MissingSubmission_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BulkForwardBatch" ADD CONSTRAINT "BulkForwardBatch_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BulkForwardBatch" ADD CONSTRAINT "BulkForwardBatch_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "SubmissionPeriod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BulkForwardBatch" ADD CONSTRAINT "BulkForwardBatch_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BulkForwardItem" ADD CONSTRAINT "BulkForwardItem_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "BulkForwardBatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BulkForwardItem" ADD CONSTRAINT "BulkForwardItem_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "Station"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BulkForwardItem" ADD CONSTRAINT "BulkForwardItem_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE SET NULL ON UPDATE CASCADE;
