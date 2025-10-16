import { Controller, Get, Param } from '@nestjs/common';
import { ClipsService } from './clips.service';

@Controller('clips')
export class ClipsController {
  constructor(private readonly clipsService: ClipsService) {}

  @Get()
  getAll() {
    return this.clipsService.getAllClips();
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.clipsService.getClip(+id);
  }

  @Get('game')
  async getGame() {
    const allClips = await this.clipsService.getAllClips();
    const shuffled = allClips.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 5);
  }
}
