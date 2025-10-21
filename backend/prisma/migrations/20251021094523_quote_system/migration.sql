-- CreateTable
CREATE TABLE "VolunteerSubmission" (
    "id" SERIAL NOT NULL,
    "nativeLanguage" TEXT NOT NULL,
    "countryOfOrigin" TEXT,
    "ipAddress" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VolunteerSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubmissionRecording" (
    "id" SERIAL NOT NULL,
    "nativeLanguage" TEXT NOT NULL,
    "quoteId" INTEGER NOT NULL,
    "volunteerSubmissionId" INTEGER NOT NULL,

    CONSTRAINT "SubmissionRecording_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quote" (
    "id" SERIAL NOT NULL,
    "joke" TEXT NOT NULL,
    "isUsed" BOOLEAN NOT NULL,

    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SubmissionRecording" ADD CONSTRAINT "SubmissionRecording_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmissionRecording" ADD CONSTRAINT "SubmissionRecording_volunteerSubmissionId_fkey" FOREIGN KEY ("volunteerSubmissionId") REFERENCES "VolunteerSubmission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
