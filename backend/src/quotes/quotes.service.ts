import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class QuotesService {
  private prisma = new PrismaClient();

  async getAllQuotes() {
    return await this.prisma.quote.findMany();
  }
}
