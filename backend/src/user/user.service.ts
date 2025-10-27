import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
type UserWithGamesAndRounds = Prisma.UserGetPayload<{
  include: {
    games: {
      include: {
        rounds: true;
      };
    };
  };
}>;
@Injectable()
export class UserService {
  private prisma = new PrismaClient();

  findOne(id: string): Promise<UserWithGamesAndRounds | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        games: {
          include: {
            rounds: true,
          },
        },
      },
    });
  }

  findByEmail(email: string): Promise<UserWithGamesAndRounds | null> {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        games: {
          include: {
            rounds: true,
          },
        },
      },
    });
  }

  createOne(data: CreateUserDto) {
    return this.prisma.user.create({
      data,
      include: {
        games: {
          include: {
            rounds: true,
          },
        },
      },
    });
  }
}
