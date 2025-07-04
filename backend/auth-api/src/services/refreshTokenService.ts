import { createClient, RedisClientType } from 'redis';
import { config } from '../config/index.js';
import { RefreshTokenData } from '../types/auth.js';

export class RefreshTokenService {
  private static client: RedisClientType | null = null;

  /**
   * Initialize Redis connection
   */
  static async initialize(): Promise<void> {
    if (this.client) {
      return;
    }

    const redisConfig: any = {
      url: config.redis.url,
    };
    
    if (config.redis.password) {
      redisConfig.password = config.redis.password;
    }
    
    this.client = createClient(redisConfig);

    this.client.on('error', (err: Error) => {
      console.error('Redis Client Error:', err);
    });

    await this.client.connect();
  }

  /**
   * Store a refresh token
   */
  static async storeRefreshToken(
    tokenId: string,
    userId: string,
    expiresAt: Date
  ): Promise<void> {
    if (!this.client) {
      throw new Error('Redis client not initialized');
    }

    const tokenData: RefreshTokenData = {
      userId,
      tokenId,
      expiresAt,
    };

    const key = `refresh_token:${tokenId}`;
    const ttlSeconds = Math.floor((expiresAt.getTime() - Date.now()) / 1000);

    await this.client.setEx(key, ttlSeconds, JSON.stringify(tokenData));
  }

  /**
   * Retrieve refresh token data
   */
  static async getRefreshToken(tokenId: string): Promise<RefreshTokenData | null> {
    if (!this.client) {
      throw new Error('Redis client not initialized');
    }

    const key = `refresh_token:${tokenId}`;
    const data = await this.client.get(key);

    if (!data) {
      return null;
    }

    try {
      const tokenData = JSON.parse(data) as RefreshTokenData;
      
      // Check if token is expired
      if (new Date(tokenData.expiresAt) <= new Date()) {
        await this.revokeRefreshToken(tokenId);
        return null;
      }

      return tokenData;
    } catch (error) {
      console.error('Error parsing refresh token data:', error);
      return null;
    }
  }

  /**
   * Revoke a refresh token
   */
  static async revokeRefreshToken(tokenId: string): Promise<void> {
    if (!this.client) {
      throw new Error('Redis client not initialized');
    }

    const key = `refresh_token:${tokenId}`;
    await this.client.del(key);
  }

  /**
   * Revoke all refresh tokens for a user
   */
  static async revokeAllUserTokens(userId: string): Promise<void> {
    if (!this.client) {
      throw new Error('Redis client not initialized');
    }

    const pattern = 'refresh_token:*';
    const keys = await this.client.keys(pattern);

    for (const key of keys) {
      const data = await this.client.get(key);
      if (data) {
        try {
          const tokenData = JSON.parse(data) as RefreshTokenData;
          if (tokenData.userId === userId) {
            await this.client.del(key);
          }
        } catch (error) {
          console.error('Error parsing token data during revocation:', error);
        }
      }
    }
  }

  /**
   * Clean up expired tokens (should be run periodically)
   */
  static async cleanupExpiredTokens(): Promise<number> {
    if (!this.client) {
      throw new Error('Redis client not initialized');
    }

    const pattern = 'refresh_token:*';
    const keys = await this.client.keys(pattern);
    let cleanedCount = 0;

    for (const key of keys) {
      const data = await this.client.get(key);
      if (data) {
        try {
          const tokenData = JSON.parse(data) as RefreshTokenData;
          if (new Date(tokenData.expiresAt) <= new Date()) {
            await this.client.del(key);
            cleanedCount++;
          }
        } catch (error) {
          console.error('Error parsing token data during cleanup:', error);
          // Delete malformed data
          await this.client.del(key);
          cleanedCount++;
        }
      }
    }

    return cleanedCount;
  }

  /**
   * Generate a unique token ID
   */
  static generateTokenId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Close Redis connection
   */
  static async close(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.client = null;
    }
  }

  /**
   * Check if Redis is connected
   */
  static isConnected(): boolean {
    return this.client?.isOpen ?? false;
  }
}