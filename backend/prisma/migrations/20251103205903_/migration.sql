/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `Match` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Match_code_key" ON "Match"("code");
