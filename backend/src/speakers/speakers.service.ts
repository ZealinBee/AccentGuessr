import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class SpeakersService {
  private prisma = new PrismaClient();

  private toBlobUrl(url: string) {
    if (!url) return url;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
  }

  async getAllSpeakers() {
    const speakers = await this.prisma.speaker.findMany({
      include: { clips: true },
    });
    return speakers.map((s) => ({
      ...s,
      clips: s.clips.map((c) => ({
        ...c,
        audioUrl: this.toBlobUrl(c.audioUrl),
      })),
    }));
  }

  async getFiveRandomSpeakers() {
    const speakers = await this.prisma.speaker.findMany({
      include: { clips: true },
      take: 5,
    });
    return speakers.map((s) => ({
      ...s,
      clips: s.clips.map((c) => ({
        ...c,
        audioUrl: this.toBlobUrl(c.audioUrl),
      })),
    }));
  }
}
