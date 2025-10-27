import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AppService } from './app.service';
import { ClipsService } from './clips/clips.service';
import { SpeakersService } from './speakers/speakers.service';
import { OptionalJwtAuthGuard } from './auth/optional-jwt-auth.guard';

interface RequestWithUser extends Request {
  user?: {
    id: string;
    email?: string;
  };
}

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
  @UseGuards(OptionalJwtAuthGuard)
  async getGame(@Request() req: RequestWithUser): Promise<any[]> {
    const userId = req.user?.id || null;
    return this.speakersService.getFiveRandomSpeakers(userId);
  }
}
