-- DropForeignKey
ALTER TABLE "public"."Match" DROP CONSTRAINT "Match_ownerId_fkey";

-- AlterTable
ALTER TABLE "Match" ALTER COLUMN "currentRound" SET DEFAULT 0,
ALTER COLUMN "ownerId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "MatchPlayer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
