import { Module, forwardRef } from '@nestjs/common';
import { SpeakersController } from './speakers.controller';
import { SpeakersService } from './speakers.service';
import { UserModule } from '../user/user.module';

@Module({
  controllers: [SpeakersController],
  providers: [SpeakersService],
  exports: [SpeakersService],
  imports: [forwardRef(() => UserModule)],
})
export class SpeakersModule {}
