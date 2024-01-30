import {
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Request,
  Res,
} from '@nestjs/common';
import { TokenService } from './token.service';

@Controller('token')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @Post('refresh')
  refreshTokens(@Res({ passthrough: true }) res) {
    const refreshTokenFromCookies = res.cookie['refreshToken'];
    return this.tokenService.refreshTokens(refreshTokenFromCookies);
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res) {
    const refreshTokenFromCookies = res.cookie['refreshToken'];

    const logoutResult = this.tokenService.logout(refreshTokenFromCookies);

    if (!logoutResult) {
      throw new HttpException('Successfully', HttpStatus.OK);
    }

    res.clearCookie('refreshToken');
  }
}
