import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  Body,
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
}
