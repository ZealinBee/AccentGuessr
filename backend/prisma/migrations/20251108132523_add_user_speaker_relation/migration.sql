/*
  Warnings:

  - A unique constraint covering the columns `[speakerId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "speakerId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "User_speakerId_key" ON "User"("speakerId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_speakerId_fkey" FOREIGN KEY ("speakerId") REFERENCES "Speaker"("id") ON DELETE SET NULL ON UPDATE CASCADE;
