import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClipsModule } from './clips/clips.module';
import { SpeakersModule } from './speakers/speakers.module';
import { QuotesModule } from './quotes/quotes.module';
import { RecordingsModule } from './recordings/recordings.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { GamesModule } from './games/games.module';
import { MatchesModule } from './matches/matches.module';
@Module({
  imports: [
    ClipsModule,
    SpeakersModule,
    QuotesModule,
    RecordingsModule,
    UserModule,
    AuthModule,
    GamesModule,
    MatchesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
