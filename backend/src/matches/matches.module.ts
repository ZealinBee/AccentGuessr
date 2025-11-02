import { Module } from '@nestjs/common';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';
import { MatchesGateway } from './matches.gateway';
import { SpeakersModule } from 'src/speakers/speakers.module';

@Module({
  controllers: [MatchesController],
  providers: [MatchesService, MatchesGateway],
  exports: [MatchesService],
  imports: [SpeakersModule],
})
export class MatchesModule {}
