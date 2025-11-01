import { Controller, Post, UseGuards, Request } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { OptionalJwtAuthGuard } from 'src/auth/optional-jwt-auth.guard';

@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  async createMatch() {
    return this.matchesService.createMatch();
  }
}
