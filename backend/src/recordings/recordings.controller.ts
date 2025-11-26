import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { RecordingsService } from './recordings.service';
import type { RecordingSubmission } from './recordings.service';

@Controller('submit-recordings')
export class RecordingsController {
  constructor(private readonly recordingsService: RecordingsService) {}

  @Post()
  @UseInterceptors(AnyFilesInterceptor())
  async submitRecordings(
    @Body() body: RecordingSubmission,
    @UploadedFiles() files: Express.Multer.File[] | undefined,
  ): Promise<{
    success: boolean;
    message: string;
    recordingsCount?: number;
    urls?: string[];
  }> {
    return await this.recordingsService.processRecordings(body, files ?? []);
  }

  @Get('volunteer-voices')
  async getVolunteerVoices(): Promise<any[]> {
    return await this.recordingsService.getAllVolunteerVoices();
  }

  @Get('accents')
  async getAccents(): Promise<any[]> {
    return await this.recordingsService.getAllAccents();
  }

  @Patch('volunteer-voices/:id/reject')
  async rejectVolunteerVoice(
    @Param('id') id: string,
  ): Promise<{ success: boolean; message: string }> {
    await this.recordingsService.updateVolunteerVoiceStatus(
      parseInt(id, 10),
      'rejected',
    );
    return {
      success: true,
      message: 'Voice rejected successfully',
    };
  }

  @Patch('volunteer-voices/:id/accept')
  async acceptVolunteerVoice(
    @Param('id') id: string,
    @Body() body: { accentId: number },
  ): Promise<{ success: boolean; message: string; speakerId?: number }> {
    return await this.recordingsService.acceptVolunteerVoice(
      parseInt(id, 10),
      body.accentId,
    );
  }
}
