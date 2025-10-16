import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ClipsService } from './clips/clips.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly clipsService: ClipsService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('game')
  async getGame(): Promise<any[]> {
    const allClips = await this.clipsService.getAllClips();
    const shuffled = allClips.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 5);
  }
}
