-- DropForeignKey
ALTER TABLE "public"."MatchPlayer" DROP CONSTRAINT "MatchPlayer_matchId_fkey";

-- DropForeignKey
ALTER TABLE "public"."MatchRound" DROP CONSTRAINT "MatchRound_matchId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PlayerGuess" DROP CONSTRAINT "PlayerGuess_playerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PlayerGuess" DROP CONSTRAINT "PlayerGuess_roundId_fkey";

-- AddForeignKey
ALTER TABLE "MatchPlayer" ADD CONSTRAINT "MatchPlayer_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchRound" ADD CONSTRAINT "MatchRound_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerGuess" ADD CONSTRAINT "PlayerGuess_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "MatchRound"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerGuess" ADD CONSTRAINT "PlayerGuess_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "MatchPlayer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
