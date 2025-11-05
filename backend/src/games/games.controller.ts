import {
  Controller,
  Get,
  Delete,
  UseGuards,
  Request,
  NotFoundException,
} from '@nestjs/common';
import { GamesService } from './games.service';
import { OptionalJwtAuthGuard } from 'src/auth/optional-jwt-auth.guard';

interface RequestWithUser extends Request {
  user?: {
    id: string;
    email?: string;
  };
}

@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Get('my-games')
  @UseGuards(OptionalJwtAuthGuard)
  async myGames(@Request() req: RequestWithUser) {
    const userId = req.user?.id;
    if (!userId) throw new NotFoundException('User not found');
    return this.gamesService.findByUser(userId);
  }

  @Delete('my-games')
  @UseGuards(OptionalJwtAuthGuard)
  async deleteAllMyGames(@Request() req: RequestWithUser) {
    const userId = req.user?.id;
    if (!userId) throw new NotFoundException('User not found');
    return this.gamesService.deleteAllUserGames(userId);
  }
}
