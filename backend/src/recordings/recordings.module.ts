import { Module } from '@nestjs/common';
import { RecordingsController } from './recordings.controller';
import { RecordingsService } from './recordings.service';
import { BlobService } from './blob.service';

@Module({
  controllers: [RecordingsController],
  providers: [RecordingsService, BlobService],
})
export class RecordingsModule {}
