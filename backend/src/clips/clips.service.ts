import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class ClipsService {
  private prisma = new PrismaClient();

  private toBlobUrl(url: string) {
    if (!url) return url;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
  }

  async getAllClips() {
    const clips = await this.prisma.clip.findMany();
    return clips.map((c) => ({ ...c, audioUrl: this.toBlobUrl(c.audioUrl) }));
  }

  async getClip(id: number) {
    const clip = await this.prisma.clip.findUnique({ where: { id } });
    if (!clip) return null;
    return { ...clip, audioUrl: this.toBlobUrl(clip.audioUrl) };
  }
}
