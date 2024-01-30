import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';
import { RefreshToken } from 'src/token/entities/token.entity';
import { TokenService } from 'src/token/token.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private tokenRepository: Repository<RefreshToken>,

    private readonly tokenService: TokenService,
  ) {}

  async findOneById(userId: User['id']) {
    return await this.userRepository.findOneBy({
      id: userId,
    });
  }

  async findOne(email: string) {
    return await this.userRepository.findOne({
      where: { email },
    });
  }

  async create(createUserDto: CreateUserDto) {
    const existUser = await this.userRepository.findOne({
      where: {
        email: createUserDto.email,
      },
    });

    if (!!existUser) throw new BadRequestException('This email already exist');

    const user = await this.userRepository.save({
      email: createUserDto.email,
      password: await argon2.hash(createUserDto.password),
    });

    const accessToken = this.tokenService.createAccessToken(user.id);
    const refreshToken = this.tokenService.createRefreshToken(user.id);

    await this.tokenRepository.save({
      id: user.id,
      refreshToken,
      user,
    });

    return {
      user: {
        ...user,
        accessToken,
      },
      refreshToken,
    };
  }
}
