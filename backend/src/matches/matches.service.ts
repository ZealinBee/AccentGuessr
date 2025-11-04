import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { SpeakersService } from 'src/speakers/speakers.service';
import { MatchesGateway } from './matches.gateway';

type MatchWithRelations = Prisma.MatchGetPayload<{
  include: { matchPlayers: true; owner: true };
}>;

@Injectable()
export class MatchesService {
  private prisma: PrismaClient = new PrismaClient();
  private phaseTimers = new Map<number, NodeJS.Timeout>();

  constructor(
    private speakerService: SpeakersService,
    @Inject(forwardRef(() => MatchesGateway))
    private readonly gateway: MatchesGateway,
  ) {}

  async createMatch(): Promise<MatchWithRelations> {
    let match: MatchWithRelations | null = null;
    let attempts = 0;
    const maxAttempts = 10;

    while (!match && attempts < maxAttempts) {
      const code = Math.floor(100000 + Math.random() * 900000);

      // Check if this code is already in use by an active match
      const existingActiveMatch = await this.prisma.match.findFirst({
        where: {
          code,
          status: { not: 'finished' }, // Only check non-finished matches
        },
      });

      if (existingActiveMatch) {
        attempts++;
        continue;
      }

      try {
        match = await this.prisma.match.create({
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
      } catch (error) {
        // Handle any other database errors
        attempts++;
        if (attempts >= maxAttempts) {
          throw error;
        }
      }
    }

    if (!match) {
      throw new InternalServerErrorException(
        'Failed to generate unique match code after multiple attempts',
      );
    }

    return match;
  }

  findByCode(code: number): Promise<MatchWithRelations | null> {
    return this.prisma.match.findFirst({
      where: {
        code,
        status: { not: 'finished' }, // Only find active matches
      },
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
      throw new NotFoundException(`Match with code ${matchCode} not found`);
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
      throw new NotFoundException(`Match with code ${matchCode} not found`);
    }
    await this.prisma.matchPlayer.delete({
      where: { id: playerId },
    });
    if (match.ownerId === playerId) {
      await this.assignOwnerFirstJoined(matchCode);
    }
    const updatedMatch = await this.prisma.match.findUnique({
      where: { id: match.id },
      include: { matchPlayers: true, owner: true },
    });

    // If no players left, close the room
    if (updatedMatch && updatedMatch.matchPlayers.length === 0) {
      await this.closeMatch(match.id);
      return null; // Return null to indicate the match was closed
    }

    return updatedMatch;
  }

  async assignOwnerIfNone(matchCode: number, playerId: number) {
    const match = await this.findByCode(matchCode);
    if (!match) {
      throw new NotFoundException(`Match with code ${matchCode} not found`);
    }
    if (!match.ownerId) {
      await this.prisma.match.update({
        where: { id: match.id },
        data: { ownerId: playerId },
      });
    }
  }

  async assignOwnerFirstJoined(matchCode: number) {
    const match = await this.findByCode(matchCode);
    if (!match) {
      throw new NotFoundException(`Match with code ${matchCode} not found`);
    }
    console.log('Assigning new owner for matchCode', matchCode);
    if (match.matchPlayers.length > 0) {
      const firstPlayer = match.matchPlayers[0];
      await this.prisma.match.update({
        where: { id: match.id },
        data: { ownerId: firstPlayer.id },
      });
    } else {
      await this.prisma.match.update({
        where: { id: match.id },
        data: { ownerId: null },
      });
    }
  }

  async closeMatch(matchId: number) {
    // Clear any existing timers for this match
    const existingTimer = this.phaseTimers.get(matchId);
    if (existingTimer) {
      clearTimeout(existingTimer);
      this.phaseTimers.delete(matchId);
    }

    // Mark the match as finished
    await this.prisma.match.update({
      where: { id: matchId },
      data: {
        status: 'finished',
        phase: 'finished',
        endedAt: new Date(),
        phaseEndsAt: null,
      },
    });
    console.log(`🚪 Match ${matchId} closed - all players left.`);
  }

  async startMatch(matchCode: number) {
    const match = await this.findByCode(matchCode);
    if (!match) {
      throw new NotFoundException(`Match with code ${matchCode} not found`);
    }
    const speakers = await this.speakerService.getFiveRandomSpeakers(null);

    const roundsData = speakers.map((s, idx) => ({
      matchId: match.id,
      roundIndex: idx,
      speakerId: s.id,
    }));

    const phaseEndsAt = new Date(Date.now() + 45000); // 45 seconds for guessing

    await this.prisma.$transaction(async (tx) => {
      await tx.matchRound.createMany({ data: roundsData });

      await tx.match.update({
        where: { id: match.id },
        data: {
          status: 'in_progress',
          phase: 'guessing',
          startedAt: new Date(),
          currentRound: 0,
          phaseEndsAt,
        },
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

    // Schedule automatic transition when guessing phase ends
    this.schedulePhaseTransition(match.id, matchCode, 45000);

    return updatedMatch;
  }

  private schedulePhaseTransition(
    matchId: number,
    matchCode: number,
    delay: number,
  ) {
    // Clear any existing timer for this match
    const existingTimer = this.phaseTimers.get(matchId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    const timer = setTimeout(() => {
      void (async () => {
        const match = await this.prisma.match.findUnique({
          where: { id: matchId },
        });
        if (!match) return;

        if (match.phase === 'guessing') {
          // Time's up for guessing - all players who haven't guessed get 0 points
          await this.handleGuessingPhaseTimeout(matchId, matchCode);
        } else if (match.phase === 'post_results') {
          // Move to next round
          await this.moveToNextRound(matchId, matchCode);
        }
      })();
    }, delay);

    this.phaseTimers.set(matchId, timer);
  }

  private async handleGuessingPhaseTimeout(matchId: number, matchCode: number) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: { matchPlayers: true },
    });
    if (!match) return;

    const currentRoundIndex = match.currentRound;
    const matchRound = await this.prisma.matchRound.findFirst({
      where: { matchId: match.id, roundIndex: currentRoundIndex },
    });
    if (!matchRound) return;

    const totalPlayers = match.matchPlayers.length;
    const guessesCount = await this.prisma.playerGuess.count({
      where: { roundId: matchRound.id },
    });

    // Submit 0-score guesses for players who didn't guess
    if (guessesCount < totalPlayers) {
      const playersWhoGuessed = await this.prisma.playerGuess.findMany({
        where: { roundId: matchRound.id },
        select: { playerId: true },
      });
      const guessedPlayerIds = new Set(
        playersWhoGuessed.map((g) => g.playerId),
      );

      const playersWhoDidntGuess = match.matchPlayers.filter(
        (p) => !guessedPlayerIds.has(p.id),
      );

      await this.prisma.playerGuess.createMany({
        data: playersWhoDidntGuess.map((p) => ({
          roundId: matchRound.id,
          playerId: p.id,
          guessLong: 0,
          guessLat: 0,
          score: 0,
        })),
      });
    }

    // Mark round as resolved and move to post_results phase
    const phaseEndsAt = new Date(Date.now() + 7000);

    await this.prisma.$transaction(async (tx) => {
      await tx.matchRound.update({
        where: { id: matchRound.id },
        data: { isResolved: true, endedAt: new Date() },
      });

      await tx.match.update({
        where: { id: matchId },
        data: {
          phase: 'post_results',
          phaseEndsAt,
        },
      });
    });

    // Schedule next phase transition
    this.schedulePhaseTransition(matchId, matchCode, 7000);
  }

  private async moveToNextRound(matchId: number, matchCode: number) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
    });
    if (!match) return;

    const newRoundIndex = match.currentRound + 1;

    if (newRoundIndex >= match.maxRounds) {
      // Match is finished
      await this.prisma.match.update({
        where: { id: matchId },
        data: {
          phase: 'finished',
          status: 'finished',
          endedAt: new Date(),
          phaseEndsAt: null,
        },
      });
      console.log(`✅ Match ${matchCode} finished.`);

      const updatedMatch = await this.getFullMatchState(matchId);
      this.gateway.server
        .to(`match_${matchCode}`)
        .emit('match_finished', updatedMatch);
    } else {
      // Start next round
      const phaseEndsAt = new Date(Date.now() + 45000);

      await this.prisma.match.update({
        where: { id: matchId },
        data: {
          currentRound: newRoundIndex,
          phase: 'guessing',
          phaseEndsAt,
        },
      });
      console.log(`▶️ Match ${matchCode}: moving to round ${newRoundIndex}`);

      // Schedule next phase transition
      this.schedulePhaseTransition(matchId, matchCode, 45000);

      const updatedMatch = await this.getFullMatchState(matchId);
      console.log('im about to emit round_started to matchCode', matchCode);
      this.gateway.server
        .to(`match_${matchCode}`)
        .emit('new_round', updatedMatch);
    }
  }

  private async getFullMatchState(matchId: number) {
    return await this.prisma.match.findUnique({
      where: { id: matchId },
      include: {
        matchPlayers: true,
        owner: true,
        matchRounds: {
          include: {
            speaker: { include: { clips: true, accent: true } },
            guesses: true,
          },
          orderBy: { roundIndex: 'asc' },
        },
      },
    });
  }

  async confirmGuess(
    matchCode: number,
    playerId: number,
    guessLong: number,
    guessLat: number,
    score: number,
  ) {
    const match = await this.findByCode(matchCode);
    if (!match)
      throw new NotFoundException(`Match with code ${matchCode} not found`);

    const currentRoundIndex = match.currentRound;

    const matchRound = await this.prisma.matchRound.findFirst({
      where: { matchId: match.id, roundIndex: currentRoundIndex },
    });
    if (!matchRound) throw new NotFoundException('Match round not found');

    const totalPlayers = match.matchPlayers.length;

    // --- Transaction to insert guess and check if round is complete ---
    let allPlayersGuessed = false;

    await this.prisma.$transaction(async (tx) => {
      // create the guess
      await tx.playerGuess.create({
        data: {
          roundId: matchRound.id,
          playerId,
          guessLong,
          guessLat,
          score,
        },
      });

      // count how many guesses exist now
      const guessesCount = await tx.playerGuess.count({
        where: { roundId: matchRound.id },
      });

      if (guessesCount >= totalPlayers) {
        allPlayersGuessed = true;

        // mark round as resolved
        await tx.matchRound.update({
          where: { id: matchRound.id },
          data: { isResolved: true, endedAt: new Date() },
        });

        // mark match as post_results with 7 second timer
        const phaseEndsAt = new Date(Date.now() + 7000);

        await tx.match.update({
          where: { id: match.id },
          data: {
            phase: 'post_results',
            phaseEndsAt,
          },
        });
      }
    });

    // --- If all guessed, cancel existing timer and schedule post_results transition ---
    if (allPlayersGuessed) {
      // Clear the guessing phase timer since all players have submitted
      const existingTimer = this.phaseTimers.get(match.id);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      // Schedule the post_results -> next round transition
      this.schedulePhaseTransition(match.id, matchCode, 7000);
    }

    // --- Return fresh match state to sender ---
    return await this.getFullMatchState(match.id);
  }
}
