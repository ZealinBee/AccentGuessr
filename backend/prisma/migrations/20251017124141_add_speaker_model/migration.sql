/*
  Warnings:

  - You are about to drop the column `lat` on the `Clip` table. All the data in the column will be lost.
  - You are about to drop the column `lng` on the `Clip` table. All the data in the column will be lost.
  - Added the required column `speakerId` to the `Clip` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Clip" DROP COLUMN "lat",
DROP COLUMN "lng",
ADD COLUMN     "speakerId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Speaker" (
    "id" SERIAL NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Speaker_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Clip" ADD CONSTRAINT "Clip_speakerId_fkey" FOREIGN KEY ("speakerId") REFERENCES "Speaker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
