import { Module } from '@nestjs/common';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';
import { MatchesGateway } from './matches.gateway';

@Module({
  controllers: [MatchesController],
  providers: [MatchesService, MatchesGateway],
  exports: [MatchesService],
})
export class MatchesModule {}
