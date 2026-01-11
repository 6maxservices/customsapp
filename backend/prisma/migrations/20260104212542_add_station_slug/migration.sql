/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Station` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Station" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "slug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Station_slug_key" ON "Station"("slug");

-- CreateIndex
CREATE INDEX "Station_slug_idx" ON "Station"("slug");
