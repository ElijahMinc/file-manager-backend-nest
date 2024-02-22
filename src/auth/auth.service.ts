import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import * as argon2 from 'argon2';
import { User } from 'src/user/entities/user.entity';
import { TokenService } from 'src/token/token.service';
@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private tokenService: TokenService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findOne(email);

    if (!user) throw new UnauthorizedException();

    const isValidPassword = await argon2.verify(user.password, password);

    if (!isValidPassword)
      throw new UnauthorizedException('Invalid credentials');

    return user;
  }

  async logIn(userId: User['id']) {
    const user = await this.userService.findOneById(userId);
    const updatedRefreshToken =
      await this.tokenService.updateRefreshToken(user);

    return {
      user: {
        ...user,
        accessToken: this.tokenService.createAccessToken(userId),
      },
      refreshToken: updatedRefreshToken,
    };
    // return await this.validateUser(createUserDto.email, createUserDto.password);
  }

  async getProfile(user: User) {
    const userProfile = await this.userService.findOneById(user.id);

    return userProfile;
  }
}
