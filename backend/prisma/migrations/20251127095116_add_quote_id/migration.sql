-- AlterTable
ALTER TABLE "VolunteerVoice" ADD COLUMN     "quoteId" INTEGER;

-- AddForeignKey
ALTER TABLE "VolunteerVoice" ADD CONSTRAINT "VolunteerVoice_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE SET NULL ON UPDATE CASCADE;
