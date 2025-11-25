-- CreateEnum
CREATE TYPE "VoiceStatus" AS ENUM ('accepted', 'pending', 'rejected');

-- CreateTable
CREATE TABLE "VolunteerVoice" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "status" "VoiceStatus" NOT NULL DEFAULT 'pending',
    "userEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VolunteerVoice_pkey" PRIMARY KEY ("id")
);
