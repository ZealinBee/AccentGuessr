-- CreateEnum
CREATE TYPE "MatchPhase" AS ENUM ('guessing', 'post_results', 'finished');

-- AlterTable
ALTER TABLE "Match" ADD COLUMN     "phase" "MatchPhase" NOT NULL DEFAULT 'guessing';
