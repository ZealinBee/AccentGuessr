import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  Request,
  NotFoundException,
} from '@nestjs/common';
import { SpeakersService } from './speakers.service';
import { OptionalJwtAuthGuard } from 'src/auth/optional-jwt-auth.guard';

interface RequestWithUser extends Request {
  user?: {
    id: string;
    email?: string;
  };
}

@Controller('speakers')
export class SpeakersController {
  constructor(private readonly speakersService: SpeakersService) {}

  @Get()
  getAll() {
    return this.speakersService.getAllSpeakers();
  }

  @Get('me')
  @UseGuards(OptionalJwtAuthGuard)
  async getMySpeaker(@Request() req: RequestWithUser) {
    const userId = req.user?.id;
    if (!userId) {
      throw new NotFoundException('User not authenticated');
    }

    const speakerData = await this.speakersService.getMySpeakerData(userId);
    if (!speakerData) {
      throw new NotFoundException('No speaker associated with this user');
    }

    return speakerData;
  }
}
