import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { SpeakersService } from 'src/speakers/speakers.service';

type MatchWithRelations = Prisma.MatchGetPayload<{
  include: { matchPlayers: true; owner: true };
}>;

@Injectable()
export class MatchesService {
  private prisma: PrismaClient = new PrismaClient();

  constructor(private speakerService: SpeakersService) {}

  async createMatch(): Promise<MatchWithRelations> {
    const code = Math.floor(100000 + Math.random() * 900000);

    const match = await this.prisma.match.create({
      data: {
        code,
        maxRounds: 5,
        status: 'waiting',
      },
      include: {
        owner: true,
        matchPlayers: true,
      },
    });
    return match;
  }

  findByCode(code: number): Promise<MatchWithRelations | null> {
    return this.prisma.match.findFirst({
      where: { code },
      include: { matchPlayers: true, owner: true },
    });
  }

  async joinRoom(
    matchCode: number,
    playerName: string,
    isGuest: boolean,
  ): Promise<MatchWithRelations | null> {
    const match = await this.findByCode(matchCode);
    if (!match) {
      throw new Error('Match not found');
    }
    await this.prisma.matchPlayer.create({
      data: {
        matchId: match.id,
        name: playerName,
        isGuest,
        orderIndex: match.matchPlayers.length,
      },
    });
    const updatedMatch = await this.prisma.match.findUnique({
      where: { id: match.id },
      include: { matchPlayers: true, owner: true },
    });

    return updatedMatch;
  }

  async removePlayerFromMatch(matchCode: number, playerId: number) {
    const match = await this.findByCode(matchCode);
    if (!match) {
      throw new Error('Match not found');
    }
    await this.prisma.matchPlayer.delete({
      where: { id: playerId },
    });
    return await this.prisma.match.findUnique({
      where: { id: match.id },
      include: { matchPlayers: true, owner: true },
    });
  }

  async assignOwnerIfNone(matchCode: number, playerId: number) {
    const match = await this.findByCode(matchCode);
    if (!match) {
      throw new Error('Match not found');
    }
    if (!match.ownerId) {
      await this.prisma.match.update({
        where: { id: match.id },
        data: { ownerId: playerId },
      });
    }
  }

  async startMatch(matchCode: number) {
    const match = await this.findByCode(matchCode);
    if (!match) {
      throw new Error('Match not found');
    }
    const speakers = await this.speakerService.getFiveRandomSpeakers(null);

    const roundsData = speakers.map((s, idx) => ({
      matchId: match.id,
      roundIndex: idx,
      speakerId: s.id,
    }));

    await this.prisma.$transaction(async (tx) => {
      await tx.matchRound.createMany({ data: roundsData });

      await tx.match.update({
        where: { id: match.id },
        data: { status: 'in_progress', startedAt: new Date(), currentRound: 0 },
      });
    });

    const updatedMatch = await this.prisma.match.findUnique({
      where: { id: match.id },
      include: {
        matchPlayers: true,
        owner: true,
        matchRounds: {
          include: {
            speaker: { include: { clips: true, accent: true } },
          },
        },
      },
    });

    return updatedMatch;
  }

  async confirmGuess(
    matchCode: number,
    playerId: number,
    guessLong: number,
    guessLat: number,
    score: number,
  ) {
    const match = await this.findByCode(matchCode);
    if (!match) {
      throw new Error('Match not found');
    }
    const currentRoundIndex = match.currentRound;
    const matchRound = await this.prisma.matchRound.findFirst({
      where: {
        matchId: match.id,
        roundIndex: currentRoundIndex,
      },
    });
    if (!matchRound) {
      throw new Error('Match round not found');
    }
    await this.prisma.playerGuess.create({
      data: {
        roundId: matchRound.id,
        playerId,
        guessLong,
        guessLat,
        score,
      },
    });
    return await this.prisma.match.findUnique({
      where: { id: match.id },
      include: {
        matchPlayers: true,
        owner: true,
        matchRounds: {
          include: {
            speaker: { include: { clips: true, accent: true } },
            guesses: true,
          },
        },
      },
    });
  }
}
