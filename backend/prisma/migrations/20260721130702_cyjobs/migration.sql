/*
  Warnings:

  - A unique constraint covering the columns `[externalId,source]` on the table `Job` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[githubUsername]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Made the column `externalId` on table `Job` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "Job_externalId_key";

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "currency" TEXT,
ADD COLUMN     "employmentType" TEXT,
ADD COLUMN     "experienceLevel" TEXT,
ADD COLUMN     "remote" BOOLEAN,
ADD COLUMN     "salaryMax" DOUBLE PRECISION,
ADD COLUMN     "salaryMin" DOUBLE PRECISION,
ALTER COLUMN "externalId" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "githubUsername" TEXT;

-- CreateIndex
CREATE INDEX "Job_title_company_idx" ON "Job"("title", "company");

-- CreateIndex
CREATE INDEX "Job_postedAt_idx" ON "Job"("postedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Job_externalId_source_key" ON "Job"("externalId", "source");

-- CreateIndex
CREATE UNIQUE INDEX "User_githubUsername_key" ON "User"("githubUsername");
