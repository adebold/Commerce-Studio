import { describe, it, expect, beforeEach, jest, afterEach } from '@jest/globals';
import { AuthService } from '../../services/authService';
import { UserRepository } from '../../repositories/userRepository';
import { RefreshTokenRepository } from '../../repositories/refreshTokenRepository';
import { JwtService } from '../../services/jwtService';
import { PasswordService } from '../../services/passwordService';
import { AuthError } from '../../services/authService';
import * as bcrypt from 'bcrypt';

// Mock dependencies
jest.mock('../../repositories/userRepository');
jest.mock('../../repositories/refreshTokenRepository');
jest.mock('../../services/jwtService');
jest.mock('../../services/passwordService');
jest.mock('bcrypt');

const MockUserRepository = UserRepository as jest.MockedClass<typeof UserRepository>;
const MockRefreshTokenRepository = RefreshTokenRepository as jest.MockedClass<typeof RefreshTokenRepository>;
const MockJwtService = JwtService as jest.MockedClass<typeof JwtService>;
const MockPasswordService = PasswordService as jest.MockedClass<typeof PasswordService>;

describe('AuthService', () => {
  let authService: AuthService;
  let mockUserRepo: jest.Mocked<UserRepository>;
  let mockRefreshTokenRepo: jest.Mocked<RefreshTokenRepository>;

  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
    passwordHash: 'hashed-password',
    firstName: 'John',
    lastName: 'Doe',
    roles: ['user'],
    isActive: true,
    emailVerified: true,
    lastLoginAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUserRepo = new MockUserRepository() as jest.Mocked<UserRepository>;
    mockRefreshTokenRepo = new MockRefreshTokenRepository() as jest.Mocked<RefreshTokenRepository>;
    
    authService = new AuthService(mockUserRepo, mockRefreshTokenRepo);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('login', () => {
    const loginData = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should successfully login with valid credentials', async () => {
      // Arrange
      mockUserRepo.findByEmailOrUsername.mockResolvedValue(mockUser);
      mockUserRepo.updateLastLogin.mockResolvedValue(undefined);
      (jest.mocked(bcrypt.compare) as jest.MockedFunction<any>).mockResolvedValue(true);
      MockJwtService.generateAccessToken.mockReturnValue('access-token');
      MockJwtService.generateRefreshToken.mockReturnValue('refresh-token');
      MockJwtService.getAccessTokenExpirySeconds.mockReturnValue(900);
      mockRefreshTokenRepo.create.mockResolvedValue({
        _id: 'token-id',
        token: 'refresh-token',
        userId: mockUser._id,
        expiresAt: new Date(),
        createdAt: new Date(),
      });

      // Act
      const result = await authService.login(loginData);

      // Assert
      expect(result).toEqual({
        user: expect.objectContaining({
          id: mockUser._id,
          email: mockUser.email,
          roles: mockUser.roles,
          isActive: true,
        }),
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresIn: 900,
      });

      expect(mockUserRepo.findByEmailOrUsername).toHaveBeenCalledWith(loginData.email.toLowerCase());
      expect(jest.mocked(bcrypt.compare)).toHaveBeenCalledWith(loginData.password, mockUser.passwordHash);
      expect(MockJwtService.generateAccessToken).toHaveBeenCalledWith({
        userId: mockUser._id,
        email: mockUser.email,
        roles: mockUser.roles,
      });
      expect(mockRefreshTokenRepo.create).toHaveBeenCalledWith({
        token: 'refresh-token',
        userId: mockUser._id,
        expiresAt: expect.any(Date),
      });
    });

    it('should throw error for non-existent user', async () => {
      // Arrange
      mockUserRepo.findByEmailOrUsername.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.login(loginData)).rejects.toThrow(AuthError);
      await expect(authService.login(loginData)).rejects.toThrow('Invalid credentials');
    });

    it('should throw error for inactive user', async () => {
      // Arrange
      const inactiveUser = { ...mockUser, isActive: false };
      mockUserRepo.findByEmailOrUsername.mockResolvedValue(inactiveUser);

      // Act & Assert
      await expect(authService.login(loginData)).rejects.toThrow(AuthError);
      await expect(authService.login(loginData)).rejects.toThrow('Account is deactivated');
    });

    it('should throw error for invalid password', async () => {
      // Arrange
      mockUserRepo.findByEmailOrUsername.mockResolvedValue(mockUser);
      (bcrypt.compare as any).mockResolvedValue(false);

      // Act & Assert
      await expect(authService.login(loginData)).rejects.toThrow(AuthError);
      await expect(authService.login(loginData)).rejects.toThrow('Invalid credentials');
    });

    it('should handle database errors gracefully', async () => {
      // Arrange
      mockUserRepo.findByEmailOrUsername.mockRejectedValue(new Error('Database connection failed'));

      // Act & Assert
      await expect(authService.login(loginData)).rejects.toThrow('Database connection failed');
    });
  });

  describe('refreshToken', () => {
    const refreshTokenData = {
      refreshToken: 'valid-refresh-token',
    };

    const mockRefreshToken = {
      _id: 'token-id',
      token: 'valid-refresh-token',
      userId: mockUser._id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      createdAt: new Date(),
    };

    it('should successfully refresh token with valid refresh token', async () => {
      // Arrange
      MockJwtService.verifyRefreshToken.mockReturnValue(true);
      mockRefreshTokenRepo.findByTokenAny.mockResolvedValue(mockRefreshToken);
      mockUserRepo.findById.mockResolvedValue(mockUser);
      MockJwtService.generateAccessToken.mockReturnValue('new-access-token');
      MockJwtService.getAccessTokenExpirySeconds.mockReturnValue(900);

      // Act
      const result = await authService.refreshToken(refreshTokenData);

      // Assert
      expect(result).toEqual({
        accessToken: 'new-access-token',
        expiresIn: 900,
      });

      expect(MockJwtService.verifyRefreshToken).toHaveBeenCalledWith(refreshTokenData.refreshToken);
      expect(mockRefreshTokenRepo.findByTokenAny).toHaveBeenCalledWith(refreshTokenData.refreshToken);
      expect(mockUserRepo.findById).toHaveBeenCalledWith(mockRefreshToken.userId);
    });

    it('should throw error for invalid refresh token', async () => {
      // Arrange
      MockJwtService.verifyRefreshToken.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Act & Assert
      await expect(authService.refreshToken(refreshTokenData)).rejects.toThrow(AuthError);
      await expect(authService.refreshToken(refreshTokenData)).rejects.toThrow('Invalid refresh token');
    });

    it('should throw error for non-existent refresh token in database', async () => {
      // Arrange
      MockJwtService.verifyRefreshToken.mockReturnValue(true);
      mockRefreshTokenRepo.findByTokenAny.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.refreshToken(refreshTokenData)).rejects.toThrow(AuthError);
      await expect(authService.refreshToken(refreshTokenData)).rejects.toThrow('Invalid refresh token');
    });

    it('should throw error for expired refresh token', async () => {
      // Arrange
      const expiredToken = {
        ...mockRefreshToken,
        expiresAt: new Date(Date.now() - 1000), // 1 second ago
      };
      MockJwtService.verifyRefreshToken.mockReturnValue(true);
      mockRefreshTokenRepo.findByTokenAny.mockResolvedValue(expiredToken);

      // Act & Assert
      await expect(authService.refreshToken(refreshTokenData)).rejects.toThrow(AuthError);
      await expect(authService.refreshToken(refreshTokenData)).rejects.toThrow('Refresh token expired');
    });

    it('should throw error for non-existent user', async () => {
      // Arrange
      MockJwtService.verifyRefreshToken.mockReturnValue(true);
      mockRefreshTokenRepo.findByTokenAny.mockResolvedValue(mockRefreshToken);
      mockUserRepo.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.refreshToken(refreshTokenData)).rejects.toThrow(AuthError);
      await expect(authService.refreshToken(refreshTokenData)).rejects.toThrow('User not found');
    });

    it('should throw error for inactive user', async () => {
      // Arrange
      const inactiveUser = { ...mockUser, isActive: false };
      MockJwtService.verifyRefreshToken.mockReturnValue(true);
      mockRefreshTokenRepo.findByTokenAny.mockResolvedValue(mockRefreshToken);
      mockUserRepo.findById.mockResolvedValue(inactiveUser);

      // Act & Assert
      await expect(authService.refreshToken(refreshTokenData)).rejects.toThrow(AuthError);
      await expect(authService.refreshToken(refreshTokenData)).rejects.toThrow('Account is deactivated');
    });
  });

  describe('logout', () => {
    const logoutData = {
      refreshToken: 'valid-refresh-token',
    };

    it('should successfully logout and revoke refresh token', async () => {
      // Arrange
      MockJwtService.verifyRefreshToken.mockReturnValue(true);
      mockRefreshTokenRepo.findByTokenAny.mockResolvedValue({
        _id: 'token-id',
        token: logoutData.refreshToken,
        userId: mockUser._id,
        expiresAt: new Date(),
        createdAt: new Date(),
      });
      mockRefreshTokenRepo.revokeByToken.mockResolvedValue(true);

      // Act
      await authService.logout(logoutData);

      // Assert
      expect(mockRefreshTokenRepo.revokeByToken).toHaveBeenCalledWith(logoutData.refreshToken);
    });

    it('should handle non-existent refresh token gracefully', async () => {
      // Arrange
      MockJwtService.verifyRefreshToken.mockReturnValue(false);

      // Act & Assert
      // Should throw error for invalid token
      await expect(authService.logout(logoutData)).rejects.toThrow(AuthError);
    });

    it('should handle database errors during logout', async () => {
      // Arrange
      MockJwtService.verifyRefreshToken.mockReturnValue(true);
      mockRefreshTokenRepo.findByTokenAny.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(authService.logout(logoutData)).rejects.toThrow('Database error');
    });
  });

  describe('getCurrentUser', () => {
    const userData = {
      userId: mockUser._id,
    };

    it('should return current user data', async () => {
      // Arrange
      mockUserRepo.findById.mockResolvedValue(mockUser);

      // Act
      const result = await authService.getCurrentUser(userData);

      // Assert
      expect(result).toEqual({
        _id: mockUser._id,
        email: mockUser.email,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        roles: mockUser.roles,
        isActive: mockUser.isActive,
        emailVerified: mockUser.emailVerified,
        lastLoginAt: mockUser.lastLoginAt,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });

      expect(mockUserRepo.findById).toHaveBeenCalledWith(userData.userId);
    });

    it('should throw error for non-existent user', async () => {
      // Arrange
      mockUserRepo.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.getCurrentUser(userData)).rejects.toThrow(AuthError);
      await expect(authService.getCurrentUser(userData)).rejects.toThrow('User not found');
    });

    it('should throw error for inactive user', async () => {
      // Arrange
      const inactiveUser = { ...mockUser, isActive: false };
      mockUserRepo.findById.mockResolvedValue(inactiveUser);

      // Act & Assert
      await expect(authService.getCurrentUser(userData)).rejects.toThrow(AuthError);
      await expect(authService.getCurrentUser(userData)).rejects.toThrow('Account is deactivated');
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle malformed user data', async () => {
      // Arrange
      const malformedUser = {
        _id: mockUser._id,
        email: mockUser.email,
        // Missing required fields
      };
      mockUserRepo.findByEmailOrUsername.mockResolvedValue(malformedUser as any);

      // Act & Assert
      await expect(authService.login({
        email: 'test@example.com',
        password: 'password123',
      })).rejects.toThrow();
    });

    it('should handle concurrent refresh token operations', async () => {
      // Arrange
      MockJwtService.verifyRefreshToken.mockReturnValue(true);
      mockRefreshTokenRepo.findByTokenAny.mockResolvedValue({
        _id: 'token-id',
        token: 'valid-refresh-token',
        userId: mockUser._id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      });
      mockUserRepo.findById.mockResolvedValue(mockUser);
      MockJwtService.generateAccessToken.mockReturnValue('new-access-token');
      MockJwtService.getAccessTokenExpirySeconds.mockReturnValue(900);

      // Act - Simulate concurrent requests
      const promises = Array(5).fill(null).map(() =>
        authService.refreshToken({ refreshToken: 'valid-refresh-token' })
      );

      // Assert
      const results = await Promise.all(promises);
      results.forEach(result => {
        expect(result.accessToken).toBe('new-access-token');
      });
    });
  });
});