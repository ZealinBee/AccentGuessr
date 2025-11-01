/*
  Warnings:

  - A unique constraint covering the columns `[ownerId]` on the table `Match` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `ownerId` to the `Match` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Match" ADD COLUMN     "ownerId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Match_ownerId_key" ON "Match"("ownerId");

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "MatchPlayer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
