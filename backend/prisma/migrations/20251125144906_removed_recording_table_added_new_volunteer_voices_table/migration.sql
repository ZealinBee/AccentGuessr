/*
  Warnings:

  - You are about to drop the `SubmissionRecording` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VolunteerSubmission` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `nativeLanguage` to the `VolunteerVoice` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."SubmissionRecording" DROP CONSTRAINT "SubmissionRecording_quoteId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SubmissionRecording" DROP CONSTRAINT "SubmissionRecording_volunteerSubmissionId_fkey";

-- AlterTable
ALTER TABLE "VolunteerVoice" ADD COLUMN     "country" TEXT,
ADD COLUMN     "nativeLanguage" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."SubmissionRecording";

-- DropTable
DROP TABLE "public"."VolunteerSubmission";
