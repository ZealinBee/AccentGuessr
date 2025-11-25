-- AlterTable
ALTER TABLE "Speaker" ADD COLUMN     "medianScore" DOUBLE PRECISION;

-- CreateIndex
CREATE INDEX "Round_speakerId_score_idx" ON "Round"("speakerId", "score");
