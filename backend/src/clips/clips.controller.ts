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
}
