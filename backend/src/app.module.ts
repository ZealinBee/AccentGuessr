import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClipsModule } from './clips/clips.module';
import { SpeakersModule } from './speakers/speakers.module';
import { QuotesModule } from './quotes/quotes.module';
import { RecordingsModule } from './recordings/recordings.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
@Module({
  imports: [
    ClipsModule,
    SpeakersModule,
    QuotesModule,
    RecordingsModule,
    UserModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
