import { Module } from '@nestjs/common';
import { RecordingsController } from './recordings.controller';
import { RecordingsService } from './recordings.service';
import { BlobService } from './blob.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  controllers: [RecordingsController],
  providers: [RecordingsService, BlobService],
})
export class RecordingsModule {}
