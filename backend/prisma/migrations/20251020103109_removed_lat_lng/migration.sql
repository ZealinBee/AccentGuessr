/*
  Warnings:

  - You are about to drop the column `lat` on the `Speaker` table. All the data in the column will be lost.
  - You are about to drop the column `lng` on the `Speaker` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Speaker" DROP COLUMN "lat",
DROP COLUMN "lng",
ADD COLUMN     "country" TEXT;
