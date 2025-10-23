import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClipsModule } from './clips/clips.module';
import { SpeakersModule } from './speakers/speakers.module';
import { QuotesModule } from './quotes/quotes.module';
import { RecordingsModule } from './recordings/recordings.module';
@Module({
  imports: [ClipsModule, SpeakersModule, QuotesModule, RecordingsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
