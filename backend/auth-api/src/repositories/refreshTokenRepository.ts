import { MongoClient, Db, Collection, ObjectId } from 'mongodb';
import { DatabaseError } from '../utils/errors';
import { database } from '../config/database';

export interface RefreshToken {
  _id: string;
  token: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
  isRevoked?: boolean;
  revokedAt?: Date;
  userAgent?: string;
  ipAddress?: string;
}

export interface CreateRefreshTokenData {
  token: string;
  userId: string;
  expiresAt?: Date;
  userAgent?: string;
  ipAddress?: string;
}

export class RefreshTokenRepository {
  private collection: Collection<RefreshToken>;

  constructor() {
    const db = database.getDb();
    this.collection = db.collection<RefreshToken>('refreshTokens');
  }

  /**
   * Create a new refresh token
   */
  async create(tokenData: CreateRefreshTokenData): Promise<RefreshToken> {
    try {
      const now = new Date();
      const expiresAt = tokenData.expiresAt || new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days default

      const refreshToken: Omit<RefreshToken, '_id'> = {
        token: tokenData.token,
        userId: tokenData.userId,
        expiresAt,
        createdAt: now,
        isRevoked: false,
        ...(tokenData.userAgent && { userAgent: tokenData.userAgent }),
        ...(tokenData.ipAddress && { ipAddress: tokenData.ipAddress }),
      };

      const result = await this.collection.insertOne(refreshToken as any);
      
      if (!result.insertedId) {
        throw new DatabaseError('Failed to create refresh token');
      }

      return {
        ...refreshToken,
        _id: result.insertedId.toString(),
      };
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      
      // Handle duplicate token error
      if ((error as any).code === 11000) {
        throw new DatabaseError('Refresh token already exists', 409, 'DUPLICATE_TOKEN');
      }
      
      throw new DatabaseError('Failed to create refresh token');
    }
  }

  /**
   * Find refresh token by token string
   */
  async findByToken(token: string): Promise<RefreshToken | null> {
    try {
      const refreshToken = await this.collection.findOne({ 
        token,
        isRevoked: { $ne: true },
        expiresAt: { $gt: new Date() }
      });
      
      if (!refreshToken) {
        return null;
      }

      return {
        ...refreshToken,
        _id: refreshToken._id.toString(),
      };
    } catch (error) {
      throw new DatabaseError('Failed to find refresh token');
    }
  }

  /**
   * Find refresh token by token string (including expired/revoked)
   */
  async findByTokenAny(token: string): Promise<RefreshToken | null> {
    try {
      const refreshToken = await this.collection.findOne({ token });
      
      if (!refreshToken) {
        return null;
      }

      return {
        ...refreshToken,
        _id: refreshToken._id.toString(),
      };
    } catch (error) {
      throw new DatabaseError('Failed to find refresh token');
    }
  }

  /**
   * Find refresh token by ID
   */
  async findById(id: string): Promise<RefreshToken | null> {
    try {
      if (!ObjectId.isValid(id)) {
        return null;
      }

      const refreshToken = await this.collection.findOne({ 
        _id: new ObjectId(id) 
      } as any);
      
      if (!refreshToken) {
        return null;
      }

      return {
        ...refreshToken,
        _id: refreshToken._id.toString(),
      };
    } catch (error) {
      throw new DatabaseError('Failed to find refresh token by ID');
    }
  }

  /**
   * Find all refresh tokens for a user
   */
  async findByUserId(
    userId: string, 
    options: {
      includeRevoked?: boolean;
      includeExpired?: boolean;
      limit?: number;
      skip?: number;
    } = {}
  ): Promise<RefreshToken[]> {
    try {
      const { 
        includeRevoked = false, 
        includeExpired = false, 
        limit = 10, 
        skip = 0 
      } = options;

      const filter: any = { userId };

      if (!includeRevoked) {
        filter.isRevoked = { $ne: true };
      }

      if (!includeExpired) {
        filter.expiresAt = { $gt: new Date() };
      }

      const tokens = await this.collection
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();

      return tokens.map((token: any) => ({
        ...token,
        _id: token._id.toString(),
      }));
    } catch (error) {
      throw new DatabaseError('Failed to find refresh tokens by user ID');
    }
  }

  /**
   * Revoke a refresh token by token string
   */
  async revokeByToken(token: string): Promise<boolean> {
    try {
      const result = await this.collection.updateOne(
        { token },
        { 
          $set: { 
            isRevoked: true,
            revokedAt: new Date()
          } 
        }
      );

      return result.modifiedCount === 1;
    } catch (error) {
      throw new DatabaseError('Failed to revoke refresh token');
    }
  }

  /**
   * Revoke a refresh token by ID
   */
  async revokeById(id: string): Promise<boolean> {
    try {
      if (!ObjectId.isValid(id)) {
        return false;
      }

      const result = await this.collection.updateOne(
        { _id: new ObjectId(id) } as any,
        { 
          $set: { 
            isRevoked: true,
            revokedAt: new Date()
          } 
        }
      );

      return result.modifiedCount === 1;
    } catch (error) {
      throw new DatabaseError('Failed to revoke refresh token by ID');
    }
  }

  /**
   * Revoke all refresh tokens for a user
   */
  async revokeAllByUserId(userId: string): Promise<number> {
    try {
      const result = await this.collection.updateMany(
        { 
          userId,
          isRevoked: { $ne: true }
        },
        { 
          $set: { 
            isRevoked: true,
            revokedAt: new Date()
          } 
        }
      );

      return result.modifiedCount;
    } catch (error) {
      throw new DatabaseError('Failed to revoke all refresh tokens for user');
    }
  }

  /**
   * Delete a refresh token by token string
   */
  async deleteByToken(token: string): Promise<boolean> {
    try {
      const result = await this.collection.deleteOne({ token });
      return result.deletedCount === 1;
    } catch (error) {
      throw new DatabaseError('Failed to delete refresh token');
    }
  }

  /**
   * Delete a refresh token by ID
   */
  async deleteById(id: string): Promise<boolean> {
    try {
      if (!ObjectId.isValid(id)) {
        return false;
      }

      const result = await this.collection.deleteOne({ 
        _id: new ObjectId(id) 
      } as any);
      
      return result.deletedCount === 1;
    } catch (error) {
      throw new DatabaseError('Failed to delete refresh token by ID');
    }
  }

  /**
   * Clean up expired tokens
   */
  async cleanupExpired(): Promise<number> {
    try {
      const result = await this.collection.deleteMany({
        expiresAt: { $lt: new Date() }
      });

      return result.deletedCount;
    } catch (error) {
      throw new DatabaseError('Failed to cleanup expired tokens');
    }
  }

  /**
   * Clean up revoked tokens older than specified days
   */
  async cleanupRevoked(olderThanDays: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      const result = await this.collection.deleteMany({
        isRevoked: true,
        revokedAt: { $lt: cutoffDate }
      });

      return result.deletedCount;
    } catch (error) {
      throw new DatabaseError('Failed to cleanup revoked tokens');
    }
  }

  /**
   * Get token statistics for a user
   */
  async getTokenStats(userId: string): Promise<{
    total: number;
    active: number;
    expired: number;
    revoked: number;
  }> {
    try {
      const now = new Date();
      
      const [total, active, expired, revoked] = await Promise.all([
        this.collection.countDocuments({ userId }),
        this.collection.countDocuments({ 
          userId, 
          isRevoked: { $ne: true },
          expiresAt: { $gt: now }
        }),
        this.collection.countDocuments({ 
          userId, 
          isRevoked: { $ne: true },
          expiresAt: { $lte: now }
        }),
        this.collection.countDocuments({ 
          userId, 
          isRevoked: true 
        }),
      ]);

      return { total, active, expired, revoked };
    } catch (error) {
      throw new DatabaseError('Failed to get token statistics');
    }
  }

  /**
   * Create database indexes for optimal performance
   */
  async createIndexes(): Promise<void> {
    try {
      await Promise.all([
        // Unique index on token
        this.collection.createIndex(
          { token: 1 }, 
          { unique: true, background: true }
        ),
        
        // Index on userId for user-specific queries
        this.collection.createIndex(
          { userId: 1 }, 
          { background: true }
        ),
        
        // Index on expiresAt for cleanup operations
        this.collection.createIndex(
          { expiresAt: 1 }, 
          { background: true }
        ),
        
        // Index on isRevoked for filtering
        this.collection.createIndex(
          { isRevoked: 1 }, 
          { background: true }
        ),
        
        // Compound index for active token queries
        this.collection.createIndex(
          { userId: 1, isRevoked: 1, expiresAt: 1 }, 
          { background: true }
        ),
        
        // Index on createdAt for sorting
        this.collection.createIndex(
          { createdAt: -1 }, 
          { background: true }
        ),
        
        // TTL index for automatic cleanup of expired tokens
        this.collection.createIndex(
          { expiresAt: 1 }, 
          { 
            expireAfterSeconds: 0, // Expire at the time specified in expiresAt
            background: true 
          }
        ),
      ]);
    } catch (error) {
      throw new DatabaseError('Failed to create refresh token indexes');
    }
  }
}