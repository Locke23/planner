import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcryptjs';
import { AppConfigService } from '../../../../config/app-config.service';
import { USER_REPOSITORY } from '../../domain/repositories/iuser.repository';
import type { IUserRepository } from '../../domain/repositories/iuser.repository';
import { RedisTokenService } from './redis-token.service';

const REFRESH_TTL_SECONDS = 7 * 24 * 60 * 60;

@Injectable()
export class AuthService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: IUserRepository,
    private readonly jwt: JwtService,
    private readonly config: AppConfigService,
    private readonly tokenStore: RedisTokenService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.users.findByEmail(email);
    if (!user) return null;
    const valid = await bcrypt.compare(password, user.passwordHash);
    return valid ? user : null;
  }

  async login(userId: string, email: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.signAccess(userId, email),
      this.createRefreshToken(userId),
    ]);
    return { accessToken, refreshToken };
  }

  async refresh(userId: string, tokenId: string) {
    const exists = await this.tokenStore.exists(userId, tokenId);
    if (!exists) {
      await this.tokenStore.revokeAll(userId);
      throw new UnauthorizedException('Refresh token reuse detected');
    }
    await this.tokenStore.revoke(userId, tokenId);
    const user = await this.users.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');
    const [accessToken, refreshToken] = await Promise.all([
      this.signAccess(userId, user.email.value),
      this.createRefreshToken(userId),
    ]);
    return { accessToken, refreshToken };
  }

  async logout(userId: string, tokenId: string): Promise<void> {
    await this.tokenStore.revoke(userId, tokenId);
  }

  verifyRefreshToken(token: string): { sub: string; jti: string } {
    try {
      const publicKey = this.getPublicKey();
      return this.jwt.verify<{ sub: string; jti: string }>(token, {
        publicKey,
        algorithms: ['RS256'],
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private signAccess(userId: string, email: string): string {
    return this.jwt.sign(
      { sub: userId, email },
      {
        privateKey: this.getPrivateKey(),
        algorithm: 'RS256',
        expiresIn: this.config.jwtAccessExpiry,
      },
    );
  }

  private async createRefreshToken(userId: string): Promise<string> {
    const jti = randomUUID();
    const token = this.jwt.sign(
      { sub: userId, jti },
      { privateKey: this.getPrivateKey(), algorithm: 'RS256', expiresIn: this.config.jwtRefreshExpiry },
    );
    await this.tokenStore.store(userId, jti, REFRESH_TTL_SECONDS);
    return token;
  }

  private getPrivateKey(): string {
    return this.config.jwtPrivateKey;
  }

  private getPublicKey(): string {
    return this.config.jwtPublicKey;
  }
}
