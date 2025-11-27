import { Injectable, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { UserService } from 'src/user/user.service';

@Injectable()
export class SpeakersService {
  private prisma = new PrismaClient();
  constructor(
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
  ) {}

  private toBlobUrl(url: string) {
    if (!url) return url;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
  }

  async getAllSpeakers() {
    const speakers = await this.prisma.speaker.findMany({
      include: { clips: true, accent: true },
    });
    return speakers.map((s) => ({
      ...s,
      clips: s.clips.map((c) => ({
        ...c,
        audioUrl: this.toBlobUrl(c.audioUrl),
      })),
      accent: s.accent,
    }));
  }

  async getCountryCounts() {
    const speakers = await this.prisma.speaker.findMany({
      select: { country: true },
    });

    const countryCounts: Record<string, number> = {};

    speakers.forEach((speaker) => {
      const country = speaker.country || 'Unknown';
      countryCounts[country] = (countryCounts[country] || 0) + 1;
    });

    return countryCounts;
  }

  async getFiveRandomSpeakers(userId: string | null) {
    const speakers = await this.prisma.speaker.findMany({
      include: { clips: true, accent: true },
    });

    let playableSpeakers = speakers;

    if (userId) {
      const user = await this.userService.findOne(userId);
      console.log('User:', user);
      console.log('User games:', user?.games);

      if (user && Array.isArray(user.games)) {
        const playedSpeakerIds = new Set<number>();

        for (const game of user.games) {
          if (Array.isArray(game.rounds)) {
            for (const round of game.rounds) {
              if (round.speakerId != null) {
                playedSpeakerIds.add(round.speakerId);
              }
            }
          }
        }

        playableSpeakers = speakers.filter((s) => !playedSpeakerIds.has(s.id));
      }
    }

    console.log(
      'Playable speakers before filtering clips:',
      playableSpeakers.length,
    );

    // Check if we have at least 5 speakers before filtering
    if (!playableSpeakers || playableSpeakers.length < 5) {
      throw new BadRequestException('Unfortunately we ran out of games');
    }

    // Filter out speakers with no clips
    playableSpeakers = playableSpeakers.filter(
      (s) => Array.isArray(s.clips) && s.clips.length > 0,
    );

    console.log('Playable speakers with clips:', playableSpeakers.length);

    // If after filtering we don't have enough, we still throw an error
    // because we can't return speakers without clips
    if (playableSpeakers.length < 5) {
      throw new BadRequestException(
        'Unfortunately we ran out of games with available clips',
      );
    }

    const shuffled = [...playableSpeakers].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 5);

    return selected.map((s) => ({
      ...s,
      clips: Array.isArray(s.clips)
        ? s.clips.map((c) => ({
            ...c,
            audioUrl: this.toBlobUrl(c.audioUrl),
            transcription: c.transcription
              ? JSON.parse(JSON.stringify(c.transcription))
              : null, // <--- added line
          }))
        : [],
      accent: s.accent ?? null,
    }));
  }

  async getFiveLatestSpeakers() {
    const speakers = await this.prisma.speaker.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { clips: true, accent: true },
    });
    return speakers.map((s) => ({
      ...s,
      clips: s.clips.map((c) => ({
        ...c,
        audioUrl: this.toBlobUrl(c.audioUrl),
      })),
      accent: s.accent,
    }));
  }

  async getMySpeakerData(userId: string) {
    // First, find the user and their associated speaker
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        speaker: {
          include: {
            rounds: {
              select: {
                id: true,
                guessLat: true,
                guessLong: true,
                score: true,
                createdAt: true,
                gameId: true,
              },
            },
            accent: true,
            clips: true,
          },
        },
      },
    });

    if (!user?.speaker) {
      return null;
    }

    return {
      speaker: user.speaker,
      rounds: user.speaker.rounds,
    };
  }

  async updateAverageScoreForSpeaker(speakerId: number): Promise<void> {
    const last25Rounds = await this.prisma.round.findMany({
      where: { speakerId },
      orderBy: { createdAt: 'desc' },
      take: 25,
    });

    if (last25Rounds.length === 0) {
      return;
    }

    // Sort scores to calculate median
    const scores = last25Rounds
      .map((round) => round.score || 0)
      .sort((a, b) => a - b);

    let medianScore: number;
    const mid = Math.floor(scores.length / 2);

    if (scores.length % 2 === 0) {
      // Even number of scores: average of two middle values
      medianScore = (scores[mid - 1] + scores[mid]) / 2;
    } else {
      // Odd number of scores: middle value
      medianScore = scores[mid];
    }

    await this.prisma.speaker.update({
      where: { id: speakerId },
      data: {
        medianScore: medianScore,
      },
    });
  }
}
