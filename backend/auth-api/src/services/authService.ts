import bcrypt from 'bcrypt';
import { UserRepository, User } from '../repositories/userRepository';
import { RefreshTokenRepository } from '../repositories/refreshTokenRepository';
import { JwtService } from './jwtService';
import { LoginRequest, LoginResponse } from '../types/auth';

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export class AuthService {
  private static userRepository = new UserRepository();
  private static refreshTokenRepository = new RefreshTokenRepository();
  
  // Instance properties for dependency injection in tests
  private userRepository: UserRepository;
  private refreshTokenRepository: RefreshTokenRepository;

  constructor(
    userRepo?: UserRepository,
    refreshTokenRepo?: RefreshTokenRepository
  ) {
    this.userRepository = userRepo || AuthService.userRepository;
    this.refreshTokenRepository = refreshTokenRepo || AuthService.refreshTokenRepository;
  }

  /**
   * Authenticate user with email/username and password (instance method)
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const { email, password } = credentials;

      // Find user by email or username
      const user = await this.userRepository.findByEmailOrUsername(email.toLowerCase());
      if (!user) {
        throw new AuthError('Invalid credentials');
      }

      if (!user.isActive) {
        throw new AuthError('Account is deactivated');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        throw new AuthError('Invalid credentials');
      }

      // Update last login
      await this.userRepository.updateLastLogin(user._id);

      // Generate tokens
      const accessToken = JwtService.generateAccessToken({
        userId: user._id,
        email: user.email,
        roles: user.roles,
      });

      const refreshToken = JwtService.generateRefreshToken();
      
      // Store refresh token
      const refreshTokenExpiry = new Date();
      refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7); // 7 days
      
      await this.refreshTokenRepository.create({
        token: refreshToken,
        userId: user._id,
        expiresAt: refreshTokenExpiry,
      });

      // Create user profile without sensitive data
      const userProfile = {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      return {
        accessToken,
        refreshToken,
        user: userProfile,
        expiresIn: JwtService.getAccessTokenExpirySeconds(),
      };
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      throw new Error('Database connection failed');
    }
  }

  /**
   * Refresh access token using refresh token (instance method)
   */
  async refreshToken(refreshTokenOrData: string | { refreshToken: string }): Promise<{ accessToken: string; expiresIn: number }> {
    try {
      const refreshToken = typeof refreshTokenOrData === 'string'
        ? refreshTokenOrData
        : refreshTokenOrData.refreshToken;

      // Verify refresh token format
      if (!JwtService.verifyRefreshToken(refreshToken)) {
        throw new AuthError('Invalid refresh token');
      }

      // Get refresh token data
      const tokenData = await this.refreshTokenRepository.findByTokenAny(refreshToken);
      if (!tokenData || tokenData.isRevoked) {
        throw new AuthError('Invalid refresh token');
      }

      if (tokenData.expiresAt < new Date()) {
        throw new AuthError('Refresh token expired');
      }

      // Get user
      const user = await this.userRepository.findById(tokenData.userId);
      if (!user) {
        throw new AuthError('User not found');
      }

      if (!user.isActive) {
        throw new AuthError('Account is deactivated');
      }

      // Generate new access token
      const accessToken = JwtService.generateAccessToken({
        userId: user._id!.toString(),
        email: user.email,
        roles: user.roles,
      });

      return {
        accessToken,
        expiresIn: JwtService.getAccessTokenExpirySeconds(),
      };
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      throw new AuthError('Invalid refresh token');
    }
  }

  /**
   * Logout user by revoking refresh token (instance method)
   */
  async logout(refreshTokenOrData: string | { refreshToken: string }): Promise<void> {
    try {
      const refreshToken = typeof refreshTokenOrData === 'string'
        ? refreshTokenOrData
        : refreshTokenOrData.refreshToken;

      // Verify refresh token format
      if (!JwtService.verifyRefreshToken(refreshToken)) {
        throw new AuthError('Invalid refresh token');
      }

      // Check if token exists in database (including expired/revoked)
      const tokenData = await this.refreshTokenRepository.findByTokenAny(refreshToken);
      if (!tokenData) {
        throw new AuthError('Invalid refresh token');
      }

      // Delete the refresh token
      const deleted = await this.refreshTokenRepository.deleteByToken(refreshToken);
      if (!deleted) {
        throw new AuthError('Invalid refresh token');
      }
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      if (error instanceof Error && error.message === 'Database error') {
        throw error;
      }
      // For other errors, throw invalid token error
      throw new AuthError('Invalid refresh token');
    }
  }

  /**
   * Get user profile by user ID (instance method)
   */
  async getCurrentUser(userIdOrData: string | { userId: string }): Promise<Omit<User, 'passwordHash'>> {
    try {
      const userId = typeof userIdOrData === 'string'
        ? userIdOrData
        : userIdOrData.userId;
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new AuthError('User not found');
      }

      if (!user.isActive) {
        throw new AuthError('Account is deactivated');
      }

      // Return user profile without sensitive data
      const { passwordHash, ...profile } = user;
      return {
        ...profile,
        _id: user._id!.toString(),
      };
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      throw new AuthError('User not found');
    }
  }

  /**
   * Authenticate user with email/username and password (static method)
   */
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    const instance = new AuthService();
    return instance.login(credentials);
  }

  /**
   * Refresh access token using refresh token (static method)
   */
  static async refreshToken(refreshToken: string): Promise<{ accessToken: string; expiresIn: number }> {
    const instance = new AuthService();
    return instance.refreshToken(refreshToken);
  }

  /**
   * Logout user by revoking refresh token (static method)
   */
  static async logout(refreshToken: string): Promise<void> {
    const instance = new AuthService();
    return instance.logout(refreshToken);
  }

  /**
   * Get user profile by user ID (static method)
   */
  static async getUserProfile(userId: string): Promise<Omit<User, 'passwordHash'>> {
    const instance = new AuthService();
    return instance.getCurrentUser(userId);
  }

  /**
   * Create a new user account
   */
  static async createUser(userData: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    roles?: string[];
  }): Promise<Omit<User, 'passwordHash'>> {
    const { email, password, firstName = '', lastName = '', roles = ['user'] } = userData;

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(email.toLowerCase());
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create new user
    const user = await this.userRepository.create({
      email: email.toLowerCase(),
      passwordHash,
      firstName,
      lastName,
      roles,
      isActive: true,
      emailVerified: false,
    });

    // Return user profile without sensitive data
    const { passwordHash: _, ...profile } = user;
    return {
      ...profile,
      _id: user._id!.toString(),
    };
  }

  /**
   * Change user password
   */
  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await this.userRepository.updateById(userId, { passwordHash: newPasswordHash });

    // Revoke all refresh tokens for security
    await this.refreshTokenRepository.revokeAllByUserId(userId);
  }

  /**
   * Verify access token and return user data
   */
  static async verifyAccessToken(token: string): Promise<Omit<User, 'passwordHash'>> {
    const payload = JwtService.verifyAccessToken(token);
    
    // Get fresh user data
    const user = await this.userRepository.findById(payload.userId);
    if (!user || !user.isActive) {
      throw new Error('User not found or inactive');
    }

    // Return user profile without sensitive data
    const { passwordHash, ...profile } = user;
    return {
      ...profile,
      _id: user._id!.toString(),
    };
  }

  /**
   * Revoke all refresh tokens for a user (useful for security incidents)
   */
  static async revokeAllUserTokens(userId: string): Promise<void> {
    await this.refreshTokenRepository.revokeAllByUserId(userId);
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(
    userId: string,
    updates: {
      firstName?: string;
      lastName?: string;
      email?: string;
    }
  ): Promise<Omit<User, 'passwordHash'>> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check if email is being changed and if it's already taken
    if (updates.email && updates.email !== user.email) {
      const existingUser = await this.userRepository.findByEmail(updates.email.toLowerCase());
      if (existingUser && existingUser._id!.toString() !== userId) {
        throw new Error('Email already in use');
      }
    }

    // Prepare update data
    const updateData: any = {};
    if (updates.firstName !== undefined) updateData.firstName = updates.firstName;
    if (updates.lastName !== undefined) updateData.lastName = updates.lastName;
    if (updates.email !== undefined) updateData.email = updates.email.toLowerCase();

    // Update user
    const updatedUser = await this.userRepository.updateById(userId, updateData);
    
    if (!updatedUser) {
      throw new Error('Failed to update user');
    }

    // Return user profile without sensitive data
    const { passwordHash, ...profile } = updatedUser;
    return {
      ...profile,
      _id: updatedUser._id!.toString(),
    };
  }
}