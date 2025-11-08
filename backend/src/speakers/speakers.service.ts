import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { UserService } from 'src/user/user.service';

@Injectable()
export class SpeakersService {
  private prisma = new PrismaClient();
  constructor(private userService: UserService) {}

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
}
