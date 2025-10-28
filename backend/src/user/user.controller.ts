import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  NotFoundException,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Prisma } from '@prisma/client';
import { OptionalJwtAuthGuard } from 'src/auth/optional-jwt-auth.guard';

interface RequestWithUser extends Request {
  user?: {
    id: string;
    email?: string;
  };
}
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.userService.findOne(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  @Post()
  async createOne(@Body() dto: CreateUserDto) {
    // If a user with this email already exists, return it instead of creating duplicate
    const existing = await this.userService.findByEmail(dto.email);
    if (existing) return existing;
    return this.userService.createOne(dto);
  }

  @Post('submit-game')
  @UseGuards(OptionalJwtAuthGuard)
  async submitGame(
    @Body() game: Prisma.GameCreateNestedManyWithoutUserInput,
    @Request() req: RequestWithUser,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new NotFoundException('User not found');
    }
    return this.userService.submitGame(userId, game);
  }
}
