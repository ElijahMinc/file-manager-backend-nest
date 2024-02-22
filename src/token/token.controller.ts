import {
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { TokenService } from './token.service';
import { Request } from 'express';

@Controller('token')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @Post('refresh')
  async refreshTokens(
    @Res({ passthrough: true }) res,
    @Req() request: Request,
  ) {
    const refreshTokenFromCookies = request.cookies['refreshToken'];

    const { refreshToken, accessToken } = await this.tokenService.refreshTokens(
      refreshTokenFromCookies,
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });

    return { accessToken };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res, @Req() request: Request) {
    const refreshTokenFromCookies = request.cookies['refreshToken'];

    const logoutResult = this.tokenService.logout(refreshTokenFromCookies);

    if (!logoutResult) {
      throw new HttpException('Successfully', HttpStatus.OK);
    }

    res.clearCookie('refreshToken');
  }
}
