/*
  Warnings:

  - You are about to drop the column `clipId` on the `MatchRound` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."MatchRound" DROP CONSTRAINT "MatchRound_clipId_fkey";

-- AlterTable
ALTER TABLE "MatchRound" DROP COLUMN "clipId";
