import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

type RoundShape = {
  id: number;
  score: number;
  guessLat: number;
  guessLong: number;
  gameId: number;
  speakerId: number;
  speaker?: {
    id: number;
    country?: string | null;
    accent?: {
      id: number;
      name: string;
      region: any;
      description?: string | null;
      type?: string | null;
      createdAt: Date;
    } | null;
  } | null;
};

type GameShape = {
  id: number;
  totalScore: number;
  rounds: RoundShape[];
  userId: string;
  createdAt: Date;
};

@Injectable()
export class GamesService {
  private prisma: any = new PrismaClient() as any;

  findByUser(userId: string): Promise<GameShape[]> {
    return this.prisma.game.findMany({
      where: { userId },
      include: {
        rounds: {
          include: {
            speaker: {
              include: {
                accent: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }) as Promise<GameShape[]>;
  }

  async deleteAllUserGames(userId: string): Promise<{ count: number }> {
    const result = await this.prisma.game.deleteMany({
      where: { userId },
    });
    return { count: result.count };
  }
}
