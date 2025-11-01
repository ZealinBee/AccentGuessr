/*
  Warnings:

  - You are about to drop the column `guestName` on the `MatchPlayer` table. All the data in the column will be lost.
  - Added the required column `name` to the `MatchPlayer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MatchPlayer" DROP COLUMN "guestName",
ADD COLUMN     "name" TEXT NOT NULL;
