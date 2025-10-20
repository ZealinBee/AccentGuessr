import { Controller, Get } from '@nestjs/common';
import { SpeakersService } from './speakers.service';

@Controller('speakers')
export class SpeakersController {
  constructor(private readonly speakersService: SpeakersService) {}

  @Get()
  getAll() {
    return this.speakersService.getAllSpeakers();
  }
}
