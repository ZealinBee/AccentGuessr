import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ClipsService } from './clips/clips.service';
import { SpeakersService } from './speakers/speakers.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly clipsService: ClipsService,
    private readonly speakersService: SpeakersService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('game')
  async getGame(): Promise<any[]> {
    return this.speakersService.getFiveRandomSpeakers();
  }
}
