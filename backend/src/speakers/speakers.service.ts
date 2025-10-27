import { Injectable } from '@nestjs/common';
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

    // Randomize and select 5 speakers
    const shuffled = [...playableSpeakers].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 5);

    // Format result
    return selected.map((s) => ({
      ...s,
      clips: Array.isArray(s.clips)
        ? s.clips.map((c) => ({
            ...c,
            audioUrl: this.toBlobUrl(c.audioUrl),
          }))
        : [],
      accent: s.accent ?? null,
    }));
  }
}
