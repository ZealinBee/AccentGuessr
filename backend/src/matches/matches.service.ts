import { Injectable, BadRequestException } from '@nestjs/common';
import { Match, PrismaClient } from '@prisma/client';

@Injectable()
export class MatchesService {
  private prisma: PrismaClient = new PrismaClient();

  /**
   * Create a new match and make the given user the owner.
   * Implementation: create match (without ownerId), create MatchPlayer for owner, then update match.ownerId.
   * All steps are executed in a transaction to avoid partial state.
   */
  async createMatch(userId: string): Promise<Match> {
    if (!userId) throw new BadRequestException('User id is required');

    // could be better
    const code = Math.floor(100000 + Math.random() * 900000);
    const result = await this.prisma.$transaction(async (tx) => {
      const match = await tx.match.create({
        data: {
          code,
          maxRounds: 5,
        },
      });

      const ownerPlayer = await tx.matchPlayer.create({
        data: {
          matchId: match.id,
          userId,
          isGuest: false,
          orderIndex: 0,
        },
      });

      const updated = await tx.match.update({
        where: { id: match.id },
        data: { ownerId: ownerPlayer.id },
        include: { owner: true, matchPlayers: true },
      });

      return updated;
    });

    return result;
  }
}
