import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

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
  createdAt: Date;
};

@Injectable()
export class GamesService {
  private prisma: any = new PrismaClient() as any;

  findByUser(userId: string): Promise<GameShape[]> {
    return this.prisma.game.findMany({
      where: { userId },
      include: { rounds: true },
      orderBy: { createdAt: 'desc' },
    }) as Promise<GameShape[]>;
  }
}
