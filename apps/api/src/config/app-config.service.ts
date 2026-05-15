import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AppEnv } from './env';

@Injectable()
export class AppConfigService {
  constructor(private readonly config: ConfigService<AppEnv, true>) {}

  get port(): number {
    return this.config.get('PORT', { infer: true });
  }

  get isProduction(): boolean {
    return this.config.get('NODE_ENV', { infer: true }) === 'production';
  }

  get redisUrl(): string {
    return this.config.get('REDIS_URL', { infer: true });
  }

  get jwtPrivateKey(): string {
    return Buffer.from(
      this.config.get('JWT_PRIVATE_KEY', { infer: true }),
      'base64',
    ).toString('utf-8');
  }

  get jwtPublicKey(): string {
    return Buffer.from(
      this.config.get('JWT_PUBLIC_KEY', { infer: true }),
      'base64',
    ).toString('utf-8');
  }

  get jwtAccessExpiry(): string {
    return this.config.get('JWT_ACCESS_EXPIRY', { infer: true });
  }

  get jwtRefreshExpiry(): string {
    return this.config.get('JWT_REFRESH_EXPIRY', { infer: true });
  }

  get corsOrigin(): string {
    return this.config.get('CORS_ORIGIN', { infer: true });
  }
}
