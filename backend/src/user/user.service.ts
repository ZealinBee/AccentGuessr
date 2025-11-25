import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { SpeakersService } from '../speakers/speakers.service';
// Minimal local types to avoid depending on generated Prisma types at compile time.
type RoundShape = {
  id: number;
  score: number;
  guessLat: number;
  guessLong: number;
  gameId: number;
  speakerId: number;
};

type GameShape = {
  id: number;
  totalScore: number;
  rounds: RoundShape[];
  userId: string;
};

type UserWithGamesAndRounds = {
  id: string;
  email: string;
  picture?: string | null;
  name?: string | null;
  createdAt: Date;
  games: GameShape[];
};
@Injectable()
export class UserService {
  private prisma: any = new PrismaClient() as any;

  constructor(
    @Inject(forwardRef(() => SpeakersService))
    private speakersService: SpeakersService,
  ) {}

  findOne(id: string): Promise<UserWithGamesAndRounds | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        games: {
          include: {
            rounds: true,
          },
        },
      },
    }) as Promise<UserWithGamesAndRounds | null>;
  }

  findByEmail(email: string): Promise<UserWithGamesAndRounds | null> {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        games: {
          include: {
            rounds: true,
          },
        },
      },
    }) as Promise<UserWithGamesAndRounds | null>;
  }

  createOne(data: CreateUserDto): Promise<UserWithGamesAndRounds> {
    return this.prisma.user.create({
      data,
      include: {
        games: {
          include: {
            rounds: true,
          },
        },
      },
    }) as Promise<UserWithGamesAndRounds>;
  }

  async submitGame(
    userId: string,
    game: any,
  ): Promise<UserWithGamesAndRounds | null> {
    await this.prisma.game.create({
      data: {
        totalScore: game.totalScore,
        user: { connect: { id: userId } },
        rounds: {
          create: game.rounds.map((r: any) => ({
            score: r.score,
            guessLat: r.guessLat,
            guessLong: r.guessLong,
            speakerId: r.speakerId,
          })),
        },
      },
      include: { rounds: true },
    });

    // Update median score for each speaker in the game
    const speakerIds = game.rounds.map((r: any) => r.speakerId as number);
    const uniqueSpeakerIds = [...new Set<number>(speakerIds)];
    for (const speakerId of uniqueSpeakerIds) {
      await this.speakersService.updateAverageScoreForSpeaker(speakerId);
    }

    return this.findOne(userId);
  }
}
