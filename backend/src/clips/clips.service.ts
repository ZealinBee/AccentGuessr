import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const BLOB_BASE = process.env.AUDIO_BLOB_BASE;

@Injectable()
export class ClipsService {
  private prisma = new PrismaClient();

  private toBlobUrl(url: string) {
    if (!url) return url;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const name = url.split('/').filter(Boolean).pop();
    return name ? `${BLOB_BASE}/${name}` : url;
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
