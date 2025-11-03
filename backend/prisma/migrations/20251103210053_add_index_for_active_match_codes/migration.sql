-- DropIndex
DROP INDEX "public"."Match_code_key";

-- CreateIndex
CREATE INDEX "Match_code_status_idx" ON "Match"("code", "status");
