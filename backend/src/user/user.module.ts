import { Module, forwardRef } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { SpeakersModule } from '../speakers/speakers.module';

@Module({
  imports: [forwardRef(() => SpeakersModule)],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
