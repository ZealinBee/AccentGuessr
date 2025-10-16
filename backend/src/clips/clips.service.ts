import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class ClipsService {
  private prisma = new PrismaClient();

  async getAllClips() {
    return this.prisma.clip.findMany();
  }

  async getClip(id: number) {
    return this.prisma.clip.findUnique({ where: { id } });
  }
}
