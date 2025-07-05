import { MongoClient, Db, Collection, ObjectId } from 'mongodb';
import { DatabaseError } from '../utils/errors';
import { database } from '../config/database';

export interface User {
  _id: string;
  email: string;
  username?: string;
  passwordHash: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  emailVerified?: boolean;
  emailVerificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
}

export interface CreateUserData {
  email: string;
  username?: string;
  passwordHash: string;
  firstName?: string;
  lastName?: string;
  roles?: string[];
  isActive?: boolean;
  emailVerified?: boolean;
}

export interface UpdateUserData {
  email?: string;
  username?: string;
  passwordHash?: string;
  roles?: string[];
  isActive?: boolean;
  lastLoginAt?: Date;
  emailVerified?: boolean;
  emailVerificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
}

export class UserRepository {
  private collection: Collection<User>;

  constructor() {
    const db = database.getDb();
    this.collection = db.collection<User>('users');
  }

  /**
   * Create a new user
   */
  async create(userData: CreateUserData): Promise<User> {
    try {
      const now = new Date();
      const user: Omit<User, '_id'> = {
        email: userData.email.toLowerCase(),
        passwordHash: userData.passwordHash,
        roles: userData.roles || ['user'],
        isActive: userData.isActive !== undefined ? userData.isActive : true,
        emailVerified: userData.emailVerified || false,
        createdAt: now,
        updatedAt: now,
      };

      const result = await this.collection.insertOne(user as any);
      
      if (!result.insertedId) {
        throw new DatabaseError('Failed to create user');
      }

      return {
        ...user,
        _id: result.insertedId.toString(),
      };
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      
      // Handle duplicate email error
      if ((error as any).code === 11000) {
        throw new DatabaseError('Email already exists', 409, 'DUPLICATE_EMAIL');
      }
      
      throw new DatabaseError('Failed to create user');
    }
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | null> {
    try {
      if (!ObjectId.isValid(id)) {
        return null;
      }

      const user = await this.collection.findOne({ _id: new ObjectId(id) } as any);
      
      if (!user) {
        return null;
      }

      return {
        ...user,
        _id: user._id.toString(),
      };
    } catch (error) {
      throw new DatabaseError('Failed to find user by ID');
    }
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    try {
      const user = await this.collection.findOne({ 
        email: email.toLowerCase() 
      });
      
      if (!user) {
        return null;
      }

      return {
        ...user,
        _id: user._id.toString(),
      };
    } catch (error) {
      throw new DatabaseError('Failed to find user by email');
    }
  }

  /**
   * Find user by username
   */
  async findByUsername(username: string): Promise<User | null> {
    try {
      const user = await this.collection.findOne({
        username: username.toLowerCase()
      });
      
      if (!user) {
        return null;
      }

      return {
        ...user,
        _id: user._id.toString(),
      };
    } catch (error) {
      throw new DatabaseError('Failed to find user by username');
    }
  }

  /**
   * Find user by email or username
   */
  async findByEmailOrUsername(identifier: string): Promise<User | null> {
    try {
      const lowerIdentifier = identifier.toLowerCase();
      const user = await this.collection.findOne({
        $or: [
          { email: lowerIdentifier },
          { username: lowerIdentifier }
        ]
      });
      
      if (!user) {
        return null;
      }

      return {
        ...user,
        _id: user._id.toString(),
      };
    } catch (error) {
      throw new DatabaseError('Failed to find user by email or username');
    }
  }

  /**
   * Update user by ID
   */
  async updateById(id: string, updateData: UpdateUserData): Promise<User | null> {
    try {
      if (!ObjectId.isValid(id)) {
        return null;
      }

      const updateDoc: any = {
        ...updateData,
        updatedAt: new Date(),
      };

      // Normalize email if provided
      if (updateData.email) {
        updateDoc.email = updateData.email.toLowerCase();
      }

      const result = await this.collection.findOneAndUpdate(
        { _id: new ObjectId(id) } as any,
        { $set: updateDoc },
        { returnDocument: 'after' }
      );

      if (!result) {
        return null;
      }

      return {
        ...result,
        _id: result._id.toString(),
      };
    } catch (error) {
      // Handle duplicate email error
      if ((error as any).code === 11000) {
        throw new DatabaseError('Email already exists', 409, 'DUPLICATE_EMAIL');
      }
      
      throw new DatabaseError('Failed to update user');
    }
  }

  /**
   * Delete user by ID
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
      throw new DatabaseError('Failed to delete user');
    }
  }

  /**
   * Find users with pagination
   */
  async findMany(
    filter: Partial<Pick<User, 'isActive' | 'emailVerified'>> = {},
    options: {
      skip?: number;
      limit?: number;
      sort?: Record<string, 1 | -1>;
    } = {}
  ): Promise<{ users: User[]; total: number }> {
    try {
      const { skip = 0, limit = 10, sort = { createdAt: -1 } } = options;

      const [users, total] = await Promise.all([
        this.collection
          .find(filter)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .toArray(),
        this.collection.countDocuments(filter),
      ]);

      return {
        users: users.map((user: any) => ({
          ...user,
          _id: user._id.toString(),
        })),
        total,
      };
    } catch (error) {
      throw new DatabaseError('Failed to find users');
    }
  }

  /**
   * Update last login time
   */
  async updateLastLogin(id: string): Promise<void> {
    try {
      if (!ObjectId.isValid(id)) {
        return;
      }

      await this.collection.updateOne(
        { _id: new ObjectId(id) } as any,
        { 
          $set: { 
            lastLoginAt: new Date(),
            updatedAt: new Date(),
          } 
        }
      );
    } catch (error) {
      throw new DatabaseError('Failed to update last login');
    }
  }

  /**
   * Create database indexes for optimal performance
   */
  async createIndexes(): Promise<void> {
    try {
      await Promise.all([
        // Unique index on email
        this.collection.createIndex(
          { email: 1 }, 
          { unique: true, background: true }
        ),
        
        // Index on isActive for filtering
        this.collection.createIndex(
          { isActive: 1 }, 
          { background: true }
        ),
        
        // Index on roles for role-based queries
        this.collection.createIndex(
          { roles: 1 }, 
          { background: true }
        ),
        
        // Index on createdAt for sorting
        this.collection.createIndex(
          { createdAt: -1 }, 
          { background: true }
        ),
        
        // Compound index for email verification
        this.collection.createIndex(
          { email: 1, emailVerified: 1 }, 
          { background: true }
        ),
      ]);
    } catch (error) {
      throw new DatabaseError('Failed to create user indexes');
    }
  }
}