import { Body, Controller, Post, Res, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(
    @Res() res,
    @Body(new ValidationPipe()) createUserDto: CreateUserDto,
  ) {
    const { user, refreshToken } = await this.userService.create(createUserDto);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });

    return res.send(user);
  }
}
