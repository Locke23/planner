import { Injectable, Inject } from '@nestjs/common';
import Redis from 'ioredis';

export const REDIS_CLIENT = 'REDIS_CLIENT';

@Injectable()
export class RedisTokenService {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  private key(userId: string, tokenId: string): string {
    return `refresh:${userId}:${tokenId}`;
  }

  async store(userId: string, tokenId: string, ttlSeconds: number): Promise<void> {
    await this.redis.set(this.key(userId, tokenId), '1', 'EX', ttlSeconds);
  }

  async exists(userId: string, tokenId: string): Promise<boolean> {
    const val = await this.redis.get(this.key(userId, tokenId));
    return val !== null;
  }

  async revoke(userId: string, tokenId: string): Promise<void> {
    await this.redis.del(this.key(userId, tokenId));
  }

  async revokeAll(userId: string): Promise<void> {
    const keys = await this.redis.keys(`refresh:${userId}:*`);
    if (keys.length > 0) await this.redis.del(...keys);
  }
}
