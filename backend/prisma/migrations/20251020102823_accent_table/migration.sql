/*
  Warnings:

  - Added the required column `accentId` to the `Speaker` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Speaker" ADD COLUMN     "accentId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Accent" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "region" JSONB NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Accent_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Speaker" ADD CONSTRAINT "Speaker_accentId_fkey" FOREIGN KEY ("accentId") REFERENCES "Accent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
