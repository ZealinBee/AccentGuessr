import { Prisma } from '@prisma/client';

export class CreateUserDto implements Prisma.UserCreateInput {
  email: string;
  name?: string | null;
  picture?: string | null;
  games?: Prisma.GameCreateNestedManyWithoutUserInput;
}
