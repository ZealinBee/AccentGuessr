import {
  Controller,
  Get,
  Delete,
  UseGuards,
  Request,
  NotFoundException,
  Query,
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

  @Get('percentile')
  async getPercentile(
    @Query('speakerId') speakerId: string,
    @Query('score') score: string,
  ) {
    const speakerIdNum = parseInt(speakerId, 10);
    const scoreNum = parseInt(score, 10);

    if (isNaN(speakerIdNum) || isNaN(scoreNum)) {
      throw new NotFoundException('Invalid speakerId or score');
    }

    const percentile = await this.gamesService.calculatePercentileForSpeaker(
      speakerIdNum,
      scoreNum,
    );

    return { percentile };
  }
}
