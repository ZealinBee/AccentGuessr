import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClipsModule } from './clips/clips.module';
import { SpeakersModule } from './speakers/speakers.module';
@Module({
  imports: [ClipsModule, SpeakersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
