import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import {
  EXPIRES_IN_ACCESS_TOKEN,
  EXPIRES_IN_REFRESH_TOKEN,
} from 'src/constants';
import { User } from 'src/user/entities/user.entity';
import { RefreshToken } from './entities/token.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TokenService {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly tokenRepository: Repository<RefreshToken>,
    private jwtService: JwtService,
  ) {}

  async logout(refreshToken: string) {
    const refreshTokenFromDb = await this.tokenRepository.findOne({
      where: {
        refreshToken,
      },
    });

    if (!refreshTokenFromDb) {
      return null;
    }

    await this.tokenRepository.delete(refreshTokenFromDb.id);
  }

  async refreshTokens(refreshToken: string) {
    const token = await this.tokenRepository.findOne({
      where: {
        refreshToken,
      },
      relations: {
        user: true,
      },
    });

    console.log('token', token);

    if (!token) {
      throw new UnauthorizedException('No refresh token');
    }

    const isVerify = this.verifyRefreshToken(token.refreshToken);

    if (!isVerify) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const updatedRefreshToken = this.createRefreshToken(token.id);
    const newAccessToken = this.createAccessToken(token.id);

    await this.tokenRepository.update(token.id, {
      refreshToken: updatedRefreshToken,
    });

    return { accessToken: newAccessToken, refreshToken: updatedRefreshToken };
  }

  verifyRefreshToken(refreshToken: string) {
    return this.jwtService.verify(refreshToken);
  }

  async updateRefreshToken(user: User) {
    const refreshToken = await this.tokenRepository.findOne({
      where: {
        id: user.id,
      },
      relations: {
        user: true,
      },
    });
    console.log('refreshToken', refreshToken);
    const newRefreshToken = this.createRefreshToken(user.id);

    if (!!refreshToken) {
      await this.tokenRepository.update(refreshToken.id, {
        refreshToken: newRefreshToken,
      });
    } else {
      await this.tokenRepository.save({
        id: user.id,
        refreshToken: newRefreshToken,
        user,
      });
    }

    return await this.tokenRepository.findOneBy({
      id: user.id,
    });
  }

  async deleteRefreshToken(user: User) {
    const refreshToken = await this.tokenRepository.findOne({
      where: {
        id: user.id,
      },
      relations: {
        user: true,
      },
    });

    return await this.tokenRepository.remove(refreshToken);
  }

  async getRefreshToken(user: User) {
    return this.tokenRepository.findOne({
      where: {
        user,
      },
    });
  }

  createAccessToken(userId: User['id']) {
    return this.jwtService.sign(
      { id: userId },
      { expiresIn: EXPIRES_IN_ACCESS_TOKEN },
    );
  }

  createRefreshToken(userId: User['id']) {
    return this.jwtService.sign(
      { id: userId },
      { expiresIn: EXPIRES_IN_REFRESH_TOKEN },
    );
  }
}
