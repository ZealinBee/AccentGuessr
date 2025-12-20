import { Injectable, BadRequestException } from '@nestjs/common';
import { BlobService } from './blob.service';
import { PrismaClient } from '@prisma/client';

export interface RecordingSubmission {
  nativeLanguage: string;
  countryOfOrigin?: string;
  quoteId: string | number;
  userId?: string;
  userEmail?: string;
}

@Injectable()
export class RecordingsService {
  private prisma: any = new PrismaClient();

  constructor(private readonly blobService: BlobService) {}

  // ✅ Helper to sanitize filenames for Azure Blob Storage
  // ✅ Helper to sanitize filenames for Azure Blob Storage
  private sanitizeFilename(name: string): string {
    // Remove or replace characters that are invalid in Azure Blob Storage names
    // Azure disallows: \ / ? # [ ] (and generally unsafe URL chars)
    // We’ll allow only alphanumeric, dot, underscore, and hyphen
    return name
      .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace unsafe characters
      .replace(/_+/g, '_') // Collapse multiple underscores
      .replace(/^_+|_+$/g, ''); // Trim leading/trailing underscores
  }

  async processRecordings(
    body: RecordingSubmission,
    files: Express.Multer.File[],
  ): Promise<{
    success: boolean;
    message: string;
    recordingsCount?: number;
    urls?: string[];
  }> {
    console.log('=== Recording Submission ===');
    console.log('Form Data:', body);
    console.log('\nFiles Received:', files?.length ?? 0);

    if (!files || files.length === 0) {
      throw new BadRequestException('No audio files received.');
    }

    // Check file size (1 MB = 1_000_000 bytes)
    const tooLarge = files.find((file) => file.size > 1_000_000);
    if (tooLarge) {
      throw new BadRequestException(
        `File "${tooLarge.originalname}" is too large (${(
          tooLarge.size / 1024
        ).toFixed(1)} KB). Clips must be under 1 MB (~1 minute).`,
      );
    }

    files.forEach((file, index) => {
      console.log(`\nFile ${index + 1}:`, {
        fieldname: file.fieldname,
        originalname: file.originalname,
        sanitizedName: this.sanitizeFilename(file.originalname),
        mimetype: file.mimetype,
        size: `${(file.size / 1024).toFixed(2)} KB`,
      });
    });

    // Upload files to Blob Storage and collect URLs
    const urls: string[] = [];

    for (const file of files) {
      try {
        // Create a sanitized copy of the file object
        const safeFile = {
          ...file,
          originalname: this.sanitizeFilename(file.originalname),
        };

        const url = await this.blobService.uploadRecording(
          safeFile,
          this.sanitizeFilename(body.nativeLanguage),
          body.countryOfOrigin
            ? this.sanitizeFilename(body.countryOfOrigin)
            : undefined,
          body.userId,
        );
        urls.push(url);

        // Save to VolunteerVoice table
        await this.prisma.volunteerVoice.create({
          data: {
            url,
            userEmail: body.userEmail || null,
            status: 'pending', // Default status
            nativeLanguage: body.nativeLanguage,
            country: body.countryOfOrigin || null,
            quoteId:
              typeof body.quoteId === 'string'
                ? parseInt(body.quoteId, 10)
                : body.quoteId,
          },
        });
      } catch (err) {
        console.error('Upload failed for', file.originalname, err);
        throw new BadRequestException(
          'Failed to upload one or more recordings',
        );
      }
    }

    console.log('========================\n');

    return {
      success: true,
      message: 'Recordings received successfully.',
      recordingsCount: files.length,
      urls,
    };
  }

  async getAllVolunteerVoices(): Promise<any[]> {
    return await this.prisma.volunteerVoice.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getAllAccents(): Promise<any[]> {
    return await this.prisma.accent.findMany({
      select: {
        id: true,
        name: true,
        type: true,
        createdAt: true,
        // Exclude region field as it's too large
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async updateVolunteerVoiceStatus(
    id: number,
    status: 'accepted' | 'pending' | 'rejected',
  ): Promise<any> {
    return await this.prisma.volunteerVoice.update({
      where: { id },
      data: { status },
    });
  }

  async acceptVolunteerVoice(
    id: number,
    accentId: number,
  ): Promise<{ success: boolean; message: string; speakerId?: number }> {
    // Get the volunteer voice
    const volunteerVoice = await this.prisma.volunteerVoice.findUnique({
      where: { id },
    });

    if (!volunteerVoice) {
      throw new BadRequestException('Volunteer voice not found');
    }

    if (volunteerVoice.status === 'accepted') {
      throw new BadRequestException('Voice already accepted');
    }

    // Create the speaker
    const speaker = await this.prisma.speaker.create({
      data: {
        accentId,
        country: volunteerVoice.country || null,
      },
    });

    // Create the clip
    await this.prisma.clip.create({
      data: {
        audioUrl: volunteerVoice.url,
        speakerId: speaker.id,
      },
    });

    // Update the volunteer voice status to accepted
    await this.prisma.volunteerVoice.update({
      where: { id },
      data: { status: 'accepted' },
    });

    // Mark the quote as used if quoteId exists
    if (volunteerVoice.quoteId) {
      await this.prisma.quote.update({
        where: { id: volunteerVoice.quoteId },
        data: { isUsed: true },
      });
    }

    // If there's an email, link the speaker to the user with that email
    if (volunteerVoice.userEmail) {
      try {
        await this.prisma.user.update({
          where: { email: volunteerVoice.userEmail },
          data: { speakerId: speaker.id },
        });
      } catch {
        // User might not exist, which is fine - just log it
        console.log(
          `No user found with email ${volunteerVoice.userEmail}, speaker not linked to user`,
        );
      }
    }

    return {
      success: true,
      message: 'Voice accepted and speaker created successfully',
      speakerId: speaker.id,
    };
  }
}
