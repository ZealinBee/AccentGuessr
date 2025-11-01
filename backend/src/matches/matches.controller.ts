import { Controller, Post, UseGuards, Request } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { OptionalJwtAuthGuard } from 'src/auth/optional-jwt-auth.guard';

interface RequestWithUser extends Request {
  user?: {
    id: string;
    email?: string;
  };
}

@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  async createMatch(@Request() req: RequestWithUser) {
    const userId = req.user?.id;
    const randomGuestId = `guest_${Math.random().toString(36).substring(2, 15)}`;
    return this.matchesService.createMatch(userId ?? randomGuestId);
  }
}
