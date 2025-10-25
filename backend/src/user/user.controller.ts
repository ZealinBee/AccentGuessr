import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';

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
}
